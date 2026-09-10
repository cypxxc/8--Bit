import { requireOwner } from '@/lib/backend/auth';
import { database } from '@/lib/backend/db';
import { failure, json } from '@/lib/backend/http';
import { messageLabel, type Conversation } from '@/lib/line/types';
import { refreshLineProfile } from '@/lib/backend/line-profile';
import type { ChatMessage } from '@/lib/line/types';
export async function GET(request:Request) {
  try {
    await requireOwner();
    const params = new URL(request.url).searchParams;
    const q = (params.get('q') || '').slice(0,100).replace(/[^\p{L}\p{M}\p{N} @._-]/gu,'');
    const page = Math.max(0,Math.min(10000,Number(params.get('page')) || 0));
    const buildQuery = (withIntake: boolean) => {
      const selectCols = withIntake
        ? 'id,line_user_id,display_name,picture_url,profile_updated_at,last_message_at,unread_count,intake_status,intake_data,line_messages(kind,text,unsent)'
        : 'id,line_user_id,display_name,picture_url,profile_updated_at,last_message_at,unread_count,line_messages(kind,text,unsent)';
      let qBuilder = database().from('line_conversations').select(selectCols, { count: 'exact' })
        .not('last_message_at', 'is', null).order('last_message_at', { ascending: false }).order('id')
        .order('sent_at', { referencedTable: 'line_messages', ascending: false }).order('id', { referencedTable: 'line_messages', ascending: false })
        .limit(1, { referencedTable: 'line_messages' }).range(page * 25, page * 25 + 24);
      if (q) qBuilder = qBuilder.or(`display_name.ilike.%${q}%,line_user_id.ilike.%${q}%`);
      if (params.get('unread') === '1') qBuilder = qBuilder.gt('unread_count', 0);
      return qBuilder;
    };

    let queryRes = await buildQuery(true);
    if (queryRes.error && (queryRes.error.code === '42703' || queryRes.error.message?.includes('intake_status'))) {
      queryRes = await buildQuery(false);
    }
    const [{ data, error, count }, state] = await Promise.all([
      queryRes,
      database().from('line_inbox_state').select('verified_at,message_at').eq('id', true).maybeSingle(),
    ]);
    if (error) throw error;
    const rawRows = ((data || []) as unknown) as (Conversation & {profile_updated_at:string|null;line_messages:ChatMessage[]})[];
    const profilesToRefresh = new Set(rawRows.filter(c=>!c.profile_updated_at || Date.now()-Date.parse(c.profile_updated_at)>86400000).slice(0,5).map(c=>c.id));
    const conversations = await Promise.all(rawRows.map(async c => {
      const {line_messages,...contact}=c;
      const profile=profilesToRefresh.has(c.id) ? await refreshLineProfile(c) : null;
      return {...contact,...profile,preview:line_messages[0] ? messageLabel(line_messages[0]).slice(0,120) : ''};
    }));
    return json({conversations,count,state:state.data});
  } catch(e) {return failure(e);}
}
