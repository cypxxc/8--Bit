import { z } from 'zod';
import { requireOwner } from '@/lib/backend/auth';
import { database } from '@/lib/backend/db';
import { failure, json, body, sameOrigin, HttpError } from '@/lib/backend/http';
import { refreshLineProfile } from '@/lib/backend/line-profile';

async function room(id:string) {
  const {data,error} = await database().from('line_conversations').select('*').eq('id',id).maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404,'ไม่พบห้องสนทนา');
  return data;
}
export async function GET(request:Request) {
  try {
    await requireOwner();
    const params = new URL(request.url).searchParams;
    const id = z.string().uuid().parse(params.get('room'));
    const conversation = await room(id);
    Object.assign(conversation,await refreshLineProfile(conversation));
    let query = database().from('line_messages').select('id,conversation_id,kind,text,metadata,unsent,sent_at')
      .eq('conversation_id',id).order('sent_at',{ascending:false}).order('id',{ascending:false}).limit(51);
    if (params.has('before')) {
      const before = z.coerce.number().int().positive().safe().parse(params.get('before'));
      const cursor = await database().from('line_messages').select('sent_at,id').eq('conversation_id',id).eq('id',before).maybeSingle();
      if (cursor.error) throw cursor.error;
      if (!cursor.data) throw new HttpError(400,'ตำแหน่งข้อความไม่ถูกต้อง');
      query=query.or(`sent_at.lt.${cursor.data.sent_at},and(sent_at.eq.${cursor.data.sent_at},id.lt.${before})`);
    }
    const {data,error} = await query; if(error) throw error;
    return json({conversation,messages:data.slice(0,50).reverse(),hasMore:data.length>50});
  } catch(e) {return failure(e);}
}
export async function PATCH(request:Request) {
  try {
    sameOrigin(request); await requireOwner();
    const value = z.object({room:z.string().uuid(),through:z.number().int().positive().safe()}).parse(await body(request));
    await room(value.room);
    const {error} = await database().rpc('shop_read_line',{p_room:value.room,p_through:value.through});
    if (error) throw error;
    return json({success:true});
  } catch(e) {return failure(e);}
}
