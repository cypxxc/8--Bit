import 'server-only';
import { database } from './db';
export async function refreshLineProfile(c:{id:string;line_user_id:string;profile_updated_at?:string|null}) {
  if(c.profile_updated_at && Date.now()-Date.parse(c.profile_updated_at)<86400000)return null;
  const token=process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if(!token)return null;
  // Record attempts too so blocked/deleted accounts do not generate endless lookups.
  const checkedAt=new Date().toISOString();
  const claimed=await database().from('line_conversations').update({profile_updated_at:checkedAt}).eq('id',c.id);
  if(claimed.error)return null;
  try {
    const res=await fetch(`https://api.line.me/v2/bot/profile/${encodeURIComponent(c.line_user_id)}`,{
      headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(3000),cache:'no-store'});
    if(!res.ok)return null;
    const profile=await res.json();
    const patch={display_name:String(profile.displayName||'').slice(0,200),
      picture_url:typeof profile.pictureUrl==='string' && /^https:\/\//.test(profile.pictureUrl)?profile.pictureUrl:null,
      profile_updated_at:checkedAt};
    const {error}=await database().from('line_conversations').update(patch).eq('id',c.id);
    return error?null:patch;
  }catch{return null;}
}
