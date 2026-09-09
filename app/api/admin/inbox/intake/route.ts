import { requireOwner } from '@/lib/backend/auth';
import { database } from '@/lib/backend/db';
import { failure, json } from '@/lib/backend/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireOwner();
    const body = await request.json();
    const roomId = typeof body.roomId === 'string' ? body.roomId : '';
    if (!roomId) throw new Error('Missing roomId');

    const { error } = await database().rpc('shop_update_line_intake', {
      p_room: roomId,
      p_status: 'awaiting_device',
      p_data: {},
    });
    if (error) throw error;
    return json({ ok: true, status: 'awaiting_device' });
  } catch (e) {
    return failure(e);
  }
}
