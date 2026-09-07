"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError, formatDate } from './api';
import { useRouter } from 'next/navigation';
import { customerName, messageLabel, type Conversation, type ChatMessage } from '@/lib/line/types';

type InboxData = {conversations:Conversation[];count:number;state:{verified_at:string;message_at:string|null}|null};
type ThreadData = {conversation:Conversation;messages:ChatMessage[];hasMore:boolean};
export default function LineInbox() {
  const router = useRouter();
  const [list,setList] = useState<InboxData|null>(null), [selected,setSelected] = useState<Conversation|null>(null);
  const [thread,setThread] = useState<ThreadData|null>(null),[error,setError] = useState('');
  const [q,setQ] = useState(''),[page,setPage]=useState(0),[unread,setUnread]=useState(false);
  const [before,setBefore]=useState<number|null>(null),[refresh,setRefresh]=useState(0);
  const scroll = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const selectedId = selected?.id;
  useEffect(() => {
    let stopped=false, active=false;
    async function load() {
      if (active || document.hidden) return; active=true;
      try {
        const data=await api<InboxData>(`/api/admin/inbox?q=${encodeURIComponent(q)}&page=${page}&unread=${unread?'1':'0'}`);
        if(!stopped) {setList(data);setError('');}
      } catch(e) {
        if(!stopped) {
          if(e instanceof ApiError && e.status===401) router.replace('/admin/login');
          setError(e instanceof Error?e.message:'โหลดแชตไม่สำเร็จ');
        }
      } finally {active=false;}
    }
    void load();const timer=setInterval(()=>void load(),5000);
    document.addEventListener('visibilitychange',load);
    return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',load);};
  },[q,page,unread,refresh,router]);
  useEffect(()=>{
    if(!selectedId) return;
    let stopped=false,active=false;
    async function load() {
      if(active || document.hidden)return;active=true;
      try {
        const data=await api<ThreadData>(`/api/admin/inbox/messages?room=${selectedId}${before?`&before=${before}`:''}`);
        if(stopped)return;
        setThread(data);
        if(!before && data.messages.length && !document.hidden && nearBottom.current) {
          await api('/api/admin/inbox/messages','PATCH',{room:selectedId,through:Math.max(...data.messages.map(m=>m.id))});
        }
      }catch(e){if(!stopped)setError(e instanceof Error?e.message:'โหลดข้อความไม่สำเร็จ');}
      finally {active=false;}
    }
    void load();const timer=setInterval(()=>void load(),5000);
    document.addEventListener('visibilitychange',load);
    return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',load);};
  },[selectedId,before,refresh]);
  useEffect(()=>{
    if(nearBottom.current && scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight;
  },[thread]);
  function select(c:Conversation){setSelected(c);setBefore(null);setThread(null);setError('');nearBottom.current=true;}
  function search(e:FormEvent<HTMLFormElement>){e.preventDefault();setPage(0);setQ(String(new FormData(e.currentTarget).get('customer')||''));}
  return <section aria-label="แชตลูกค้า LINE" className="line-inbox-section">
    <div className="admin-top"><div><h2>แชตลูกค้า LINE</h2><p className="admin-muted">หนึ่งห้องต่อหนึ่งบัญชีลูกค้า • อัปเดตทุก 5 วินาทีเมื่อเปิดหน้านี้</p></div>
      <button className="admin-button" onClick={()=>setRefresh(v=>v+1)}>อัปเดตแชต</button></div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {list && !list.state && <p className="admin-notice">ยังไม่ได้รับสัญญาณจาก LINE • เมื่อตั้งค่าการเชื่อมต่อแล้ว ข้อความใหม่จะปรากฏที่นี่</p>}
    {list?.state && <p className="admin-muted">รับสัญญาณ LINE ล่าสุด {formatDate(list.state.verified_at)}</p>}
    <div className={`line-inbox ${selected?'has-selection':''}`}>
      <aside className="line-rooms" aria-label="รายชื่อลูกค้า">
        <form onSubmit={search} className="line-search"><input name="customer" placeholder="ค้นหาลูกค้า" aria-label="ค้นหาลูกค้า LINE"/><button className="admin-button">ค้นหา</button></form>
        <label className="line-unread-filter"><input type="checkbox" checked={unread} onChange={e=>{setUnread(e.target.checked);setPage(0);}}/> เฉพาะยังไม่อ่าน</label>
        {!list?<p role="status">กำลังโหลดลูกค้า…</p>:!list.conversations.length?<div className="admin-empty">ยังไม่มีแชตในรายการนี้<br/>ลูกค้าทัก LINE OA แล้วจะมีห้องของตัวเองที่นี่</div>:
          list.conversations.map(c=><button key={c.id} onClick={()=>select(c)} className="line-room" aria-pressed={selectedId===c.id}>
            <span className="line-avatar" aria-hidden="true">{(c.display_name||'L').slice(0,1)}</span>
            <span className="line-room-text"><strong>{customerName(c)}</strong><span className="admin-muted">บัญชี …{c.line_user_id.slice(-8)}</span><span>{c.preview}</span><small>{formatDate(c.last_message_at)}</small></span>
            {c.unread_count>0&&<span className="line-unread" aria-label={`${c.unread_count} ข้อความยังไม่อ่าน`}>{c.unread_count}</span>}
          </button>)}
        <div className="admin-pages"><button className="admin-button" disabled={!page} onClick={()=>setPage(p=>p-1)}>ก่อนหน้า</button><small>{list?.count??0} ห้อง</small><button className="admin-button" disabled={(page+1)*25>=(list?.count??0)} onClick={()=>setPage(p=>p+1)}>ถัดไป</button></div>
      </aside>
      <div className="line-thread">
        {!selected?<div className="line-placeholder"><h3>เลือกลูกค้าเพื่อเปิดแชต</h3><p className="admin-muted">ข้อความของแต่ละคนแยกห้องชัดเจน</p></div>:<>
          <header className="line-thread-head"><button className="admin-button line-back" onClick={()=>{setSelected(null);setThread(null);}}>← รายชื่อลูกค้า</button><h3>{customerName(thread?.conversation||selected)}</h3><p className="admin-muted">บัญชี LINE …{selected.line_user_id.slice(-8)}</p></header>
          <div className="line-messages" ref={scroll} onScroll={()=>{const el=scroll.current;if(el)nearBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<100;}} aria-label="ข้อความในห้อง">
            {!thread?<p role="status">กำลังโหลดข้อความ…</p>:<>
              {before&&<button className="admin-button" onClick={()=>{setBefore(null);setThread(null);nearBottom.current=true;}}>กลับข้อความล่าสุด</button>}
              {thread.hasMore&&<button className="admin-button" onClick={()=>{setBefore(thread.messages[0].id);setThread(null);nearBottom.current=true;}}>ดูข้อความก่อนหน้า</button>}
              {thread.messages.map(m=><article key={m.id} className={`line-bubble ${m.unsent?'is-unsent':''}`}>
                <Message message={m}/><time className="admin-muted" dateTime={m.sent_at}>{formatDate(m.sent_at)}</time>
              </article>)}
            </>}
          </div>
          <footer className="line-compose-note">ตอบลูกค้าผ่าน <a href="https://manager.line.biz/" target="_blank" rel="noreferrer">LINE OA Manager</a> ในตอนนี้<br/><small>แสดงข้อความใหม่ที่รับหลังเชื่อมต่อ ไม่รวมประวัติเก่าและข้อความที่ร้านส่งจาก OA Manager</small></footer>
        </>}
      </div>
    </div>
  </section>;
}
function Message({message:m}:{message:ChatMessage}) {
  const [failed,setFailed]=useState(false);
  if(m.unsent)return <p>ลูกค้ายกเลิกส่งข้อความ</p>;
  const src=`/api/admin/inbox/content?id=${m.id}`;
  if(m.kind==='image' && !m.metadata.external)return <>{failed?<p>รูปภาพไม่พร้อมใช้งานหรือหมดอายุ</p>:
    // eslint-disable-next-line @next/next/no-img-element
    <img className="line-chat-image" src={src} alt="รูปภาพจากลูกค้า" loading="lazy" onError={()=>setFailed(true)}/>}</>;
  if(['video','audio','file'].includes(m.kind) && !m.metadata.external)return <a href={src} target="_blank" rel="noreferrer">เปิด{messageLabel(m)} {String(m.metadata.fileName||'')}</a>;
  return <p>{messageLabel(m)}{m.kind==='location'&&<><br/>{String(m.metadata.title||'')}<br/>{String(m.metadata.address||'')}</>}</p>;
}
