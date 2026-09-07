import { z } from 'zod';
import { requireOwner } from '@/lib/backend/auth';
import { database } from '@/lib/backend/db';
import { failure, HttpError } from '@/lib/backend/http';
export async function GET(request:Request) {
  try {
    await requireOwner();
    const id = z.coerce.number().int().positive().safe().parse(new URL(request.url).searchParams.get('id'));
    const {data,error} = await database().from('line_messages').select('line_message_id,kind,metadata,unsent').eq('id',id).maybeSingle();
    if(error) throw error;
    if(!data || data.unsent) throw new HttpError(404,'ไม่พบไฟล์ หรือถูกยกเลิกส่งแล้ว');
    if (!['image','audio','video','file'].includes(data.kind) || data.metadata.external) throw new HttpError(400,'กรุณาดูเนื้อหาประเภทนี้ใน LINE OA');
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
    if(!token) throw new HttpError(503,'ยังไม่ได้ตั้งค่า LINE');
    const response = await fetch(`https://api-data.line.me/v2/bot/message/${encodeURIComponent(data.line_message_id)}/content`,{
      headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(15000),cache:'no-store'});
    if (!response.ok) throw new HttpError(410,'LINE ยังไม่พร้อมให้ดาวน์โหลดไฟล์นี้ หรือไฟล์หมดอายุแล้ว');
    const mime = (response.headers.get('content-type') || '').split(';')[0];
    const inline = ['image/jpeg','image/png','image/gif','image/webp','audio/mp4','audio/mpeg','video/mp4'].includes(mime);
    return new Response(response.body,{headers:{'Content-Type':inline?mime:'application/octet-stream',
      'Content-Disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(String(data.metadata.fileName || 'line-attachment').replace(/[\r\n]/g,''))}`,
      'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
  } catch(e) {return failure(e);}
}
