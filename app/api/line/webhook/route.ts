import { receiveWebhook } from '@/lib/line/webhook';
import { database } from '@/lib/backend/db';
import { evaluateBotTransition, buildLineReplyPayload, sendLineReply } from '@/lib/line/bot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return receiveWebhook(request, {
    secret: process.env.LINE_CHANNEL_SECRET?.trim() || '',
    destination: process.env.LINE_BOT_USER_ID?.trim() || '',
    save: async (event) => {
      const db = database();
      const { error } = await db.rpc('shop_receive_line', { p_event: event });
      if (error) throw error;

      // Handle automated bot reply for message or follow events
      if (['message', 'follow'].includes(event.type) && event.replyToken) {
        try {
          const { data: conv } = await db
            .from('line_conversations')
            .select('id, intake_status, intake_data')
            .eq('line_user_id', event.userId)
            .single();

          if (conv) {
            const currentStatus = conv.intake_status || 'new';
            const currentData = conv.intake_data || {};
            const text = event.text || '';
            const kind = event.kind || 'text';

            const transition = evaluateBotTransition(currentStatus, currentData, text, kind);

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
        } catch (botErr) {
          // Log but do not fail the webhook event receipt
          console.error('LINE bot transition error:', botErr);
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

