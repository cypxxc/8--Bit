// Shop Configuration & LINE Official Account Settings
export const SHOP_CONFIG = {
  shopName: "8-BIT RIGS & SERVICES",
  shopSubtitle: "Windows, Upgrades & Computer Care",
  
  // LINE Official Account Config (แก้ไข ID ตรงนี้ได้เลย)
  line: {
    oaId: "@356qitzh",
    oaUrl: "https://lin.ee/rTDPJYr",
    qrCodeImage: "/line-oa-qr.svg",
  },

  contact: {
    phone: process.env.NEXT_PUBLIC_SHOP_PHONE || "",
    phoneHref: process.env.NEXT_PUBLIC_SHOP_PHONE ? `tel:${process.env.NEXT_PUBLIC_SHOP_PHONE.replace(/[^+\d]/g, "")}` : "",
    email: process.env.NEXT_PUBLIC_SHOP_EMAIL || "",
    address: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "",
    hours: process.env.NEXT_PUBLIC_SHOP_HOURS || "",
    mapUrl: process.env.NEXT_PUBLIC_SHOP_MAP_URL?.startsWith("https://") ? process.env.NEXT_PUBLIC_SHOP_MAP_URL : "",
  },
};

/**
 * สร้างลิงก์ส่งข้อความอัตโนมัติเข้า LINE OA (LINE URI Scheme)
 */
export function createLineShareUrl(message: string, oaId: string = SHOP_CONFIG.line.oaId) {
  // เข้ารหัสข้อความ UTF-8 สำหรับส่งผ่าน LINE URL
  const cleanId = oaId.startsWith("@") ? oaId : `@${oaId}`;
  const encodedText = encodeURIComponent(message);
  
  // ใช้รูปแบบ Line OA Direct Message URL scheme หรือ fallback ไปที่ URL ปกติ
  return `https://line.me/R/oaMessage/${cleanId}/?${encodedText}`;
}
