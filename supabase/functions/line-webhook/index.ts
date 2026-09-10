import { receiveWebhook, type IncomingLineEvent } from './webhook.ts';
import { evaluateBotTransition, buildLineReplyPayload, sendLineReply, sendLinePushMessage } from './bot.ts';

// The LINE HMAC signature authenticates requests before any database writes.
// No Supabase JWT is expected from LINE's servers.
const runtime = (globalThis as unknown as {Deno:{env:{get:(key:string)=>string|undefined};serve:(handler:(request:Request)=>Promise<Response>)=>void}}).Deno;

runtime.serve(async request => {
  const url = runtime.env.get('SUPABASE_URL')!;
  const keys = JSON.parse(runtime.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const key = keys.default || runtime.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const lineToken = runtime.env.get('LINE_CHANNEL_ACCESS_TOKEN')?.trim() || '';
  const lineAdmin = runtime.env.get('LINE_ADMIN_USER_ID')?.trim() || '';
  const headers: Record<string,string> = {'Content-Type':'application/json',apikey:key};
  if (!keys.default) headers.Authorization = `Bearer ${key}`;

  async function write(path:string,payload:unknown,prefer='') {
    const response = await fetch(`${url}/rest/v1/${path}`,{method:'POST',headers:{...headers,Prefer:prefer},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Storage unavailable');
    return response;
  }

  return receiveWebhook(request,{
    secret: runtime.env.get('LINE_CHANNEL_SECRET')?.trim() || '',
    destination: runtime.env.get('LINE_BOT_USER_ID')?.trim() || '',
    save: async (event: IncomingLineEvent) => {
      // 1. Ingest event into database atomically
      await write('rpc/shop_receive_line', { p_event: event });

      // 2. Automated bot reply and intake state transition
      let customerName = `ลูกค้า (…${event.userId?.slice(-6) || ''})`;
      let currentStatus = 'new';
      let nextStatus = 'new';

      if (['message', 'follow'].includes(event.type) && lineToken) {
        try {
          const convRes = await fetch(`${url}/rest/v1/line_conversations?line_user_id=eq.${event.userId}&select=id,display_name,intake_status,intake_data`, {
            headers,
            signal: AbortSignal.timeout(5000),
          });
          if (convRes.ok) {
            const convs = await convRes.json();
            const conv = convs && convs[0];
            if (conv) {
              if (conv.display_name) customerName = conv.display_name;
              currentStatus = conv.intake_status || 'new';
              const currentData = conv.intake_data || {};
              const text = event.text || '';
              const kind = event.kind || 'text';

              if (event.replyToken) {
                const transition = evaluateBotTransition(currentStatus, currentData, text, kind);
                nextStatus = transition.nextStatus;

                if (transition.replyText) {
                  const payload = buildLineReplyPayload(transition);
                  const sent = await sendLineReply(event.replyToken, payload, lineToken);
                  if (sent) {
                    await write('rpc/shop_update_line_intake', {
                      p_room: conv.id,
                      p_status: transition.nextStatus,
                      p_data: transition.nextData,
                    }).catch(e => console.error('Update intake error:', e));
                  }
                }
              }
            }
          }
        } catch (botErr) {
          console.error('Edge bot transition error:', botErr);
        }

        // 3. Real-time push notification to shop owner's personal LINE
        if (event.type === 'message' && lineAdmin) {
          const text = event.text || '';
          const kind = event.kind || 'text';
          const msgText = text || (kind === 'image' ? '[ลูกค้าส่งรูปภาพ]' : kind === 'sticker' ? '[ลูกค้าส่งสติกเกอร์]' : '[ไฟล์แนบ]');
          let header = '💬 ลูกค้าทักแชต LINE OA';

          if (nextStatus === 'completed' && currentStatus !== 'completed') {
            header = '🎮 ลูกค้าแจ้งข้อมูลซ่อมครบแล้ว!';
          } else if (text.includes('ติดต่อช่าง') || text.includes('คุยกับคน') || text.includes('ช่าง')) {
            header = '🧑‍🔧 ลูกค้าต้องการติดต่อช่างโดยตรง!';
          }

          const pushMsg = `🕹️ ${header}\n\n• ลูกค้า: ${customerName}\n• ข้อความ: "${msgText}"\n\nเปิดดูและตอบกลับได้ที่ระบบหลังบ้าน 8bit`;
          await sendLinePushMessage(lineAdmin, pushMsg, lineToken).catch(e => console.error('Owner push error:', e));
        }
      }
    },
    verified: () => write('line_inbox_state',{id:true,verified_at:new Date().toISOString()},'resolution=merge-duplicates')
  });
});
