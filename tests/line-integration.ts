// Exercises the real signed receiver with isolated fixtures; never sends a LINE message.
import {loadEnvConfig} from '@next/env';
import {createClient} from '@supabase/supabase-js';
import {createHmac,randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync,readFileSync,unlinkSync} from 'node:fs';
import assert from 'node:assert/strict';
loadEnvConfig(process.cwd());
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false}});
const publicDb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false}});
const base='http://localhost:3004',endpoint=process.env.NEXT_PUBLIC_SUPABASE_URL+'/functions/v1/line-webhook';
const fixturePath='.env.line-test';
interface Fixture {userId:string;email:string;password:string;lineUsers:string[];events:string[];messages:string[];rooms:string[]}
async function cleanup(f:Fixture) {
  if(!f.email.startsWith('8bit-line-test-') || !f.email.endsWith('@example.invalid'))throw Error('Unsafe cleanup');
  if(f.rooms.length){const r=await db.from('line_conversations').delete().in('id',f.rooms);if(r.error)throw r.error;}
  if(f.events.length){const r=await db.from('line_webhook_events').delete().in('event_id',f.events);if(r.error)throw r.error;}
  if(f.messages.length){const r=await db.from('line_unsent_messages').delete().in('line_message_id',f.messages);if(r.error)throw r.error;}
  if(f.userId){const r=await db.auth.admin.deleteUser(f.userId);if(r.error)throw r.error;}
}
async function main(){
  if(process.argv.includes('--cleanup')){await cleanup(JSON.parse(readFileSync(fixturePath,'utf8')));unlinkSync(fixturePath);console.log('PASS test records and account removed');return;}
  const f:Fixture={userId:'',email:`8bit-line-test-${randomUUID()}@example.invalid`,password:randomBytes(24).toString('base64url'),lineUsers:['U'+randomBytes(16).toString('hex'),'U'+randomBytes(16).toString('hex')],events:[],messages:[],rooms:[]};
  let cookie='';
  async function call(path:string,method='GET',payload?:unknown,auth=true){
    const r=await fetch(base+path,{method,headers:{Origin:base,...(auth&&cookie?{Cookie:cookie}:{}),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
    return {status:r.status,data:await r.json(),cookies:r.headers.getSetCookie()};
  }
  async function webhook(events:unknown[],valid=true){
    const body=JSON.stringify({destination:process.env.LINE_BOT_USER_ID,events});
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-line-signature':createHmac('sha256',valid?process.env.LINE_CHANNEL_SECRET!:'invalid').update(body).digest('base64')},body});
    return r.status;
  }
  function event(user:string,text:string,timestamp=Date.now()){
    const eventId='test-'+randomUUID(),messageId='test-'+randomUUID();f.events.push(eventId);f.messages.push(messageId);
    return {type:'message',webhookEventId:eventId,timestamp,source:{type:'user',userId:user},message:{type:'text',id:messageId,text}};
  }
  function unsend(original:ReturnType<typeof event>){
    const eventId='test-'+randomUUID();f.events.push(eventId);
    return {type:'unsend',webhookEventId:eventId,timestamp:Date.now(),source:original.source,unsend:{messageId:original.message.id}};
  }
  let passed=false;
  try {
    for(const path of ['/api/admin/inbox','/api/admin/inbox/messages?room='+randomUUID(),'/api/admin/inbox/content?id=1'])assert.equal((await call(path)).status,401);
    for(const table of ['line_conversations','line_messages','line_webhook_events','line_unsent_messages','line_inbox_state'])assert.ok((await publicDb.from(table).select('*').limit(1)).error);
    assert.ok((await publicDb.rpc('shop_receive_line',{p_event:{}})).error);
    console.log('PASS anonymous inbox, attachments, tables and ingest RPC denied');
    const a=event(f.lineUsers[0],'ลง Windows เครื่องแรก'),b=event(f.lineUsers[1],'เพิ่ม SSD เครื่องที่สอง');
    assert.equal(await webhook([a],false),401);
    assert.deepEqual(await Promise.all([webhook([a]),webhook([a]),webhook([b])]),[200,200,200]);
    const rooms=await db.from('line_conversations').select('*').in('line_user_id',f.lineUsers);if(rooms.error)throw rooms.error;
    f.rooms=rooms.data.map(c=>c.id);assert.equal(f.rooms.length,2);
    const roomA=rooms.data.find(c=>c.line_user_id===f.lineUsers[0])!,roomB=rooms.data.find(c=>c.line_user_id===f.lineUsers[1])!;
    assert.equal(roomA.unread_count,1);assert.equal(roomB.unread_count,1);
    const identicalName='ลูกค้าทดสอบ ชื่อเหมือนกัน';
    await db.from('line_conversations').update({display_name:identicalName,profile_updated_at:new Date().toISOString()}).in('id',f.rooms);
    console.log('PASS concurrent redelivery deduplicates and separate customer identities');
    const old=event(f.lineUsers[0],'ต้องถูกลบ',Date.now()-50000);assert.equal(await webhook([unsend(old),old]),200);
    const deleted=await db.from('line_messages').select('text,metadata,unsent').eq('line_message_id',old.message.id).single();
    assert.equal(deleted.data?.text,'');assert.equal(deleted.data?.unsent,true);assert.deepEqual(deleted.data?.metadata,{});
    console.log('PASS unsend before message prevents content resurrection');
    const account=await db.auth.admin.createUser({email:f.email,password:f.password,email_confirm:true});if(account.error)throw account.error;
    f.userId=account.data.user!.id;
    assert.equal((await call('/api/admin/auth','POST',{email:f.email,password:f.password})).status,403);
    const grant=await db.from('shop_admins').insert({user_id:f.userId});if(grant.error)throw grant.error;
    const login=await call('/api/admin/auth','POST',{email:f.email,password:f.password});assert.equal(login.status,200);
    cookie=login.cookies.map(c=>c.split(';')[0]).join('; ');
    const list=await call('/api/admin/inbox?q='+encodeURIComponent(identicalName));assert.equal(list.status,200);assert.equal(list.data.conversations.length,2);
    const thread=await call('/api/admin/inbox/messages?room='+roomA.id);assert.equal(thread.status,200);assert.equal(thread.data.messages.length,2);
    assert.ok(thread.data.messages.every((m:{conversation_id:string})=>m.conversation_id===roomA.id));
    assert.equal(thread.data.messages[0].unsent,true);
    const through=Math.max(...thread.data.messages.map((m:{id:number})=>m.id));
    assert.equal((await call('/api/admin/inbox/messages','PATCH',{room:roomA.id,through})).status,200);
    const after=await db.from('line_conversations').select('unread_count').eq('id',roomA.id).single();assert.equal(after.data?.unread_count,0);
    const second=await db.from('line_conversations').select('unread_count').eq('id',roomB.id).single();assert.equal(second.data?.unread_count,1);
    const extra=event(f.lineUsers[0],'ข้อความใหม่หลังเปิดอ่าน');await webhook([extra]);
    await call('/api/admin/inbox/messages','PATCH',{room:roomA.id,through});
    assert.equal((await db.from('line_conversations').select('unread_count').eq('id',roomA.id).single()).data?.unread_count,1);
    assert.equal((await call('/api/admin/inbox/content?id='+thread.data.messages[0].id)).status,404);
    console.log('PASS owner-only rooms, chronological order, independent read counters and late unread preservation');
    assert.equal(await webhook([unsend(a)]),200);
    const refreshed=await call('/api/admin/inbox/messages?room='+roomA.id);
    assert.equal(refreshed.data.messages.find((m:{id:number})=>m.id===thread.data.messages[1].id)?.unsent,true);
    const history=Array.from({length:55},(_,i)=>event(f.lineUsers[0],`ประวัติทดสอบ ${i+1}`,Date.now()-200000-i*1000));
    assert.equal(await webhook(history),200);
    const first=await call('/api/admin/inbox/messages?room='+roomA.id);
    assert.equal(first.data.messages.length,50);assert.equal(first.data.hasMore,true);
    const next=await call(`/api/admin/inbox/messages?room=${roomA.id}&before=${first.data.messages[0].id}`);
    assert.equal(next.status,200);assert.equal(next.data.messages.length,8);assert.equal(next.data.hasMore,false);
    assert.equal((await call(`/api/admin/inbox/messages?room=${roomB.id}&before=${first.data.messages[0].id}`)).status,400);
    console.log('PASS message pagination without gaps or cross-room cursors');
    passed=true;
    if(process.argv.includes('--keep')){writeFileSync(fixturePath,JSON.stringify(f));console.log('PASS browser fixtures prepared; credentials not displayed');}
  } finally {
    if(!passed || !process.argv.includes('--keep')){
      const rooms=await db.from('line_conversations').select('id').in('line_user_id',f.lineUsers);f.rooms=rooms.data?.map(c=>c.id)||f.rooms;
      await cleanup(f);
    }
  }
}
main().catch(e=>{console.error(e instanceof Error?e.message:'Test failed');process.exitCode=1;});
