import { z } from 'zod';
import { requireOwner } from '@/lib/backend/auth';
import { database } from '@/lib/backend/db';
import { failure, json, body, sameOrigin, HttpError } from '@/lib/backend/http';
import { sendLinePushMessage } from '@/lib/line/bot';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();

    const payload = await body(request);
    const parsed = z.object({
      roomId: z.string().uuid('รหัสห้องสนทนาไม่ถูกต้อง'),
      text: z.string().trim().min(1, 'กรุณาใส่ข้อความตอบกลับ').max(5000, 'ข้อความยาวเกินไป (สูงสุด 5,000 ตัวอักษร)'),
    }).parse(payload);

    const { data: conv, error: convErr } = await database()
      .from('line_conversations')
      .select('id, line_user_id, intake_status')
      .eq('id', parsed.roomId)
      .maybeSingle();

    if (convErr) throw convErr;
    if (!conv) throw new HttpError(404, 'ไม่พบห้องสนทนาของลูกค้า');
    if (!conv.line_user_id) throw new HttpError(400, 'ไม่พบ LINE User ID ของลูกค้ารายนี้');

    // 1. Send push message to LINE
    const pushResult = await sendLinePushMessage(conv.line_user_id, parsed.text);
    if (!pushResult.ok) {
      throw new HttpError(400, pushResult.error ? `ส่งข้อความไม่สำเร็จ: ${pushResult.error}` : 'ส่งข้อความไปยัง LINE ไม่สำเร็จ');
    }

    const now = new Date().toISOString();

    // 2. Insert message into line_messages
    let insertedMsg: Record<string, unknown> | null = null;
    const { data: fullInsert, error: insertErr } = await database()
      .from('line_messages')
      .insert({
        conversation_id: parsed.roomId,
        kind: 'text',
        text: parsed.text,
        sender: 'shop',
        sent_at: now,
      })
      .select('id, conversation_id, kind, text, metadata, unsent, sent_at, sender')
      .maybeSingle();

    if (insertErr && (insertErr.code === '42703' || insertErr.message?.includes('sender'))) {
      const { data: fallbackInsert, error: fallbackErr } = await database()
        .from('line_messages')
        .insert({
          conversation_id: parsed.roomId,
          kind: 'text',
          text: parsed.text,
          sent_at: now,
        })
        .select('id, conversation_id, kind, text, metadata, unsent, sent_at')
        .single();
      if (fallbackErr) throw fallbackErr;
      insertedMsg = { ...(fallbackInsert as Record<string, unknown>), sender: 'shop' };
    } else if (insertErr) {
      throw insertErr;
    } else {
      insertedMsg = fullInsert as Record<string, unknown>;
    }

    // 3. Update conversation last_message_at and auto handoff intake_status to completed
    const updates: Record<string, unknown> = {
      last_message_at: now,
    };
    if (conv.intake_status !== 'completed') {
      updates.intake_status = 'completed';
    }

    await database()
      .from('line_conversations')
      .update(updates)
      .eq('id', parsed.roomId);

    return json({
      success: true,
      message: insertedMsg,
    });
  } catch (e) {
    return failure(e);
  }
}
