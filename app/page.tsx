import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { database } from "@/lib/backend/db";
import type { ServiceRecord } from "@/lib/backend/types";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";
const origin = siteOrigin();
export const metadata: Metadata = {
  title: "8-Bit Computer | Windows, Software & Upgrade",
  description: "ติดตั้ง Windows และ Software อัปเกรด RAM, SSD และอุปกรณ์ พร้อมทำความสะอาดและดูแลเครื่อง สอบถามรายละเอียดและประเมินราคาผ่าน LINE OA",
  robots: { index: !!origin, follow: !!origin },
  alternates: origin ? { canonical: origin } : undefined,
  openGraph: { title: "8-Bit Computer | Windows, Software & Upgrade", locale: "th_TH", type: "website", ...(origin ? {url: origin, images: [origin + "/opengraph-image"]} : {}) },
};
export default async function Page() {
  let services: ServiceRecord[] = [];
  let error = "";
  try {
    const result = await database().from("shop_services")
      .select("id,group_id,name,description,price,active,sort_order,version")
      .eq("active", true).order("sort_order").abortSignal(AbortSignal.timeout(5000));
    if (result.error) throw result.error;
    services = result.data || [];
  } catch { error = "โหลดบริการไม่สำเร็จ กรุณาลองใหม่หรือติดต่อ LINE OA"; }
  return <LandingPage initialServices={services} initialError={error} />;
}
