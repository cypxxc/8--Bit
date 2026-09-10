import { receiveWebhook } from '@/lib/line/webhook';
import { database } from '@/lib/backend/db';
import { evaluateBotTransition, buildLineReplyPayload, sendLineReply, sendLinePushMessage, type IntakeStatus } from '@/lib/line/bot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const lineAdmin = process.env.LINE_ADMIN_USER_ID?.trim() || '';
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || '';

  return receiveWebhook(request, {
    secret: process.env.LINE_CHANNEL_SECRET?.trim() || '',
    destination: process.env.LINE_BOT_USER_ID?.trim() || '',
    save: async (event) => {
      const db = database();
      const { error } = await db.rpc('shop_receive_line', { p_event: event });
      if (error) throw error;

      let customerName = `ลูกค้า (…${event.userId?.slice(-6) || ''})`;
      let currentStatus: IntakeStatus = 'new';
      let nextStatus: IntakeStatus = 'new';

      // Handle automated bot reply for message or follow events
      if (['message', 'follow'].includes(event.type)) {
        try {
          const { data: conv } = await db
            .from('line_conversations')
            .select('id, display_name, intake_status, intake_data')
            .eq('line_user_id', event.userId)
            .single();

          if (conv) {
            if (conv.display_name) customerName = conv.display_name;
            currentStatus = (conv.intake_status as IntakeStatus) || 'new';
            const currentData = conv.intake_data || {};
            const text = event.text || '';
            const kind = event.kind || 'text';

            if (event.replyToken) {
              const transition = evaluateBotTransition(currentStatus, currentData, text, kind);
              nextStatus = transition.nextStatus;

              if (transition.replyText) {
                const payload = buildLineReplyPayload(transition);
                const sent = await sendLineReply(event.replyToken, payload);
                if (sent) {
                  await db.rpc('shop_update_line_intake', {
                    p_room: conv.id,
                    p_status: transition.nextStatus,
                    p_data: transition.nextData,
                  });
                }
              }
            }
          }
        } catch (botErr) {
          console.error('LINE bot transition error:', botErr);
        }

        // Real-time push notification to shop owner
        if (event.type === 'message' && lineAdmin && lineToken) {
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
    verified: async () => {
      const { error } = await database()
        .from('line_inbox_state')
        .upsert({ id: true, verified_at: new Date().toISOString() });
      if (error) throw error;
    },
  });
}

