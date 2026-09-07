import { receiveWebhook } from '@/lib/line/webhook';
import { database } from '@/lib/backend/db';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return receiveWebhook(request, {
    secret: process.env.LINE_CHANNEL_SECRET?.trim() || '',
    destination: process.env.LINE_BOT_USER_ID?.trim() || '',
    save: async event => {
      const {error} = await database().rpc('shop_receive_line',{p_event:event});
      if (error) throw error;
    },
    verified: async () => {
      const {error} = await database().from('line_inbox_state').upsert({id:true,verified_at:new Date().toISOString()});
      if (error) throw error;
    }
  });
}
