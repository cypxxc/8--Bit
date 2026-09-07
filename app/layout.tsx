import { siteOrigin } from "@/lib/site";
import type { Metadata } from "next";
import { Press_Start_2P, VT323, Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { connection } from "next/server";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
  display: "swap",
});

const baiJamjuree = Bai_Jamjuree({
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin() || "http://localhost:3000"),
  title: "8-Bit Computer | Windows โปรแกรม อัปเกรดและดูแลคอมพิวเตอร์",
  description: "บริการลง Windows และโปรแกรม อัปเกรด RAM SSD และอุปกรณ์ ทำความสะอาดคอมพิวเตอร์ รีเซ็ตรหัสผ่าน Windows บัญชีภายในเครื่อง ติดต่อผ่าน LINE OA",
  keywords: "8bit, ลง Windows, ลงโปรแกรม, อัปเกรดคอม, RAM, SSD, ทำความสะอาดคอม, รีเซ็ตรหัสผ่าน Windows",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render per request so CSP nonces match the scripts in this response.
  await connection();
  return (
    <html
      lang="th"
      className={`${pressStart2P.variable} ${vt323.variable} ${baiJamjuree.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090b10] text-[#e2e8f0] selection:bg-[#39ff14] selection:text-black">
        {children}
      </body>
    </html>
  );
}
