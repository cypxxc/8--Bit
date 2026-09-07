import { SHOP_CONFIG } from '@/lib/config';
import { MapPin, Phone, MessageCircle, Clock, Mail, ExternalLink } from 'lucide-react';
export default function ShopContact(){
  const c=SHOP_CONFIG.contact;
  return <footer id="contact" className="bg-[#05070a] border-t-4 border-[#1e293b] py-14 pb-28"><div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="grid md:grid-cols-3 gap-10">
      <div><p className="font-press-start text-xl text-[#86efac]">8-BIT</p><h2 className="font-thai text-xl mt-3 font-bold">บริการคอมพิวเตอร์ที่พร้อมคุยกับคุณ</h2><p className="text-[#a5b4ca] mt-3 leading-relaxed">ลง Windows และโปรแกรม อัปเกรดอุปกรณ์ ทำความสะอาด และดูแลเครื่อง กรุณานัดหมายก่อนนำเครื่องมาที่ร้าน</p></div>
      <div><h3 className="text-lg font-bold mb-4">ติดต่อร้าน</h3><a className="inline-flex items-center gap-2 bg-[#06c755] text-black px-4 py-3 font-bold" href={SHOP_CONFIG.line.oaUrl} target="_blank" rel="noreferrer"><MessageCircle size={20}/>แชต LINE {SHOP_CONFIG.line.oaId}<ExternalLink size={16}/></a>
        {c.phone&&<a className="flex items-center gap-2 mt-4" href={c.phoneHref}><Phone size={18}/>{c.phone}</a>}
        {c.email&&<a className="flex items-center gap-2 mt-4 break-all" href={`mailto:${c.email}`}><Mail size={18}/>{c.email}</a>}
      </div>
      <div><h3 className="text-lg font-bold mb-4">หน้าร้านและการนัดหมาย</h3><p className="flex items-start gap-2 text-[#cbd5e1]"><MapPin size={19} className="shrink-0 mt-1"/>{c.address||'ติดต่อ LINE OA เพื่อขอพิกัดและนัดหมายก่อนเดินทาง'}</p><p className="flex items-start gap-2 text-[#cbd5e1] mt-4"><Clock size={19} className="shrink-0 mt-1"/>{c.hours||'สอบถามวันและเวลาที่สะดวกผ่าน LINE OA'}</p>
        {c.mapUrl&&<a href={c.mapUrl} target="_blank" rel="noreferrer" className="inline-block underline text-[#7dd3fc] mt-4">เปิดแผนที่ร้าน</a>}
      </div>
    </div>
    <div id="request-data" className="mt-10 pt-6 border-t border-[#24344b] text-sm text-[#a5b4ca]"><h3 className="font-bold text-[#e2e8f0] mb-2">ข้อมูลที่ใช้ในการขอรับบริการ</h3><p className="max-w-3xl leading-relaxed">ชื่อ เบอร์โทร LINE ID และรายละเอียดเครื่องที่ส่งในฟอร์ม ใช้เพื่อติดต่อกลับและจัดการงานของคุณ โดยบันทึกในระบบหลังบ้านของร้านและส่งแจ้งเตือนให้เจ้าของร้านผ่าน LINE ไม่ต้องกรอกรหัสผ่านหรือ Recovery Key หากต้องการแก้ไขหรือลบข้อมูล กรุณาติดต่อร้านผ่าน LINE OA</p></div>
    <p className="mt-8 text-sm text-[#a5b4ca]">© {new Date().getFullYear()} 8-Bit Computer</p>
  </div></footer>;
}
