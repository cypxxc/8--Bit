export interface Conversation {
  id:string; line_user_id:string; display_name:string; picture_url:string|null;
  last_message_at:string|null; unread_count:number;
  preview?:string;
}
export interface ChatMessage {
  id:number; conversation_id:string; kind:string; text:string; unsent:boolean;
  metadata:Record<string,unknown>; sent_at:string;
}
export const messageLabel = (m: Pick<ChatMessage,'unsent'|'kind'|'text'>) => m.unsent ? 'ลูกค้ายกเลิกส่งข้อความ' :
  m.text || ({image:'รูปภาพ',video:'วิดีโอ',audio:'ข้อความเสียง',file:'ไฟล์แนบ',sticker:'สติกเกอร์',location:'ตำแหน่งที่ตั้ง'}[m.kind] || 'ข้อความประเภทอื่น');
export const customerName = (c:Conversation) => c.display_name || `ลูกค้า LINE • ${c.line_user_id.slice(-8)}`;
