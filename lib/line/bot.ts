export type IntakeStatus = 'new' | 'awaiting_device' | 'awaiting_service' | 'awaiting_issue' | 'completed';

export interface IntakeData {
  device_type?: 'PC' | 'Notebook';
  service_category?: string;
  issue_description?: string;
  completed_at?: string;
}

export interface BotTransitionResult {
  nextStatus: IntakeStatus;
  nextData: IntakeData;
  replyText: string | null;
  quickReplyOptions?: { label: string; text: string }[];
}

export const DEVICE_OPTIONS = [
  { label: '🖥️ คอมตั้งโต๊ะ (PC)', text: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)', value: 'PC' as const },
  { label: '💻 โน้ตบุ๊ก (Notebook)', text: 'โน้ตบุ๊ก (Notebook)', value: 'Notebook' as const },
];

export const SERVICE_OPTIONS = [
  { label: '🪟 ลง Windows / โปรแกรม', text: '🪟 ลง Windows / โปรแกรม', value: 'ลง Windows / โปรแกรม' },
  { label: '⚡ อัปเกรดเครื่อง (RAM/SSD)', text: '⚡ อัปเกรดเครื่อง (RAM/SSD)', value: 'อัปเกรดเครื่อง (RAM/SSD)' },
  { label: '🧹 ตรวจเช็ก / ทำความสะอาด', text: '🧹 ตรวจเช็ก / ทำความสะอาด', value: 'ตรวจเช็ก / ทำความสะอาด' },
  { label: '💬 ปรึกษาอาการทั่วไป', text: '💬 ปรึกษาอาการทั่วไป', value: 'ปรึกษาอาการทั่วไป' },
];

export function evaluateBotTransition(
  status: IntakeStatus,
  data: IntakeData,
  text: string,
  kind: string = 'text'
): BotTransitionResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Reset / Clear chat commands
  if (['เริ่มใหม่', 'reset', '/reset', 'ลบแชท', 'ล้างแชท', 'ล้างข้อมูล', 'clear'].includes(lower)) {
    return {
      nextStatus: 'awaiting_device',
      nextData: {},
      replyText: '🕹️ 8bit Shop Assistant: รีเซ็ตข้อมูลเรียบร้อยครับ!\n\nเพื่อความสะดวกรวดเร็ว กรุณาเลือกประเภทอุปกรณ์ของคุณ เพื่อเริ่มต้นใหม่อีกครั้ง:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // 2. Change / Re-select service category commands
  if (['เลือกบริการใหม่', 'เปลี่ยนบริการ', 'เลือกงานใหม่', 'เปลี่ยนงาน'].includes(lower)) {
    if (data.device_type) {
      return {
        nextStatus: 'awaiting_service',
        nextData: { device_type: data.device_type },
        replyText: `📋 เลือกบริการใหม่สำหรับ (${data.device_type})\nกรุณาเลือกบริการที่ต้องการครับ:`,
        quickReplyOptions: SERVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
      };
    }
    return {
      nextStatus: 'awaiting_device',
      nextData: {},
      replyText: '🕹️ เพื่อเลือกบริการ กรุณาเลือกประเภทอุปกรณ์ของคุณก่อนนะครับ:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // 3. Contact human technician commands
  if (['ติดต่อช่าง', 'คุยกับคน', 'แอดมิน', 'โทร', 'ช่าง'].includes(lower)) {
    return {
      nextStatus: 'completed',
      nextData: data,
      replyText: '🧑‍🔧 ส่งเรื่องให้ช่างแล้วครับ!\nช่างได้รับแจ้งเตือนแล้ว และจะรีบเข้ามาตรวจสอบพร้อมตอบกลับในแชตนี้สักครู่นะครับ ขอบคุณครับ 🙏',
    };
  }

  // 4. Menu & Help commands
  if (['เมนู', 'ช่วยเหลือ', 'help', '/help', 'คำสั่ง'].includes(lower)) {
    return {
      nextStatus: status,
      nextData: data,
      replyText: '🕹️ เมนูคำสั่งลัด 8bit Shop:\n\n• พิมพ์ "เริ่มใหม่" หรือ "ลบแชท" เพื่อเริ่มต้นใหม่\n• พิมพ์ "เลือกบริการใหม่" เพื่อเปลี่ยนรายการบริการ\n• พิมพ์ "ติดต่อช่าง" เพื่อรอคุยกับช่างโดยตรง\n\nหรือแตะเลือกปุ่มคำสั่งด้านล่างนี้ได้เลยครับ 👇',
      quickReplyOptions: [
        { label: '🔄 ลบแชท/เริ่มใหม่', text: 'เริ่มใหม่' },
        { label: '📋 เลือกบริการใหม่', text: 'เลือกบริการใหม่' },
        { label: '🧑‍🔧 ติดต่อช่าง', text: 'ติดต่อช่าง' },
      ],
    };
  }

  // Already completed - do not interrupt human conversation
  if (status === 'completed') {
    return {
      nextStatus: 'completed',
      nextData: data,
      replyText: null,
    };
  }

  // New customer or uninitialized state -> prompt to choose device
  if (status === 'new') {
    return {
      nextStatus: 'awaiting_device',
      nextData: data,
      replyText: '🕹️ สวัสดีครับ ยินดีต้อนรับสู่ 8bit!\nเพื่อความสะดวกรวดเร็ว ช่างขอข้อมูลเบื้องต้นสักนิดนะครับ\nกรุณาเลือกประเภทอุปกรณ์ของคุณ:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // Awaiting device selection
  if (status === 'awaiting_device') {
    const isNb = /โน้ต|notebook|laptop/i.test(trimmed);
    const isPc = /คอม|pc|ตั้งโต๊ะ/i.test(trimmed);

    if (isNb || isPc) {
      const device_type = isNb && !/ตั้งโต๊ะ|\(pc\)/i.test(trimmed) ? 'Notebook' : 'PC';
      return {
        nextStatus: 'awaiting_service',
        nextData: { ...data, device_type },
        replyText: `รับทราบครับ (${device_type}) 🔧\nกรุณาเลือกบริการที่ต้องการ:`,
        quickReplyOptions: SERVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
      };
    }

    // Default prompt to choose device
    return {
      nextStatus: 'awaiting_device',
      nextData: data,
      replyText: '🕹️ สวัสดีครับ ยินดีต้อนรับสู่ 8bit!\nเพื่อความสะดวกรวดเร็ว ช่างขอข้อมูลเบื้องต้นสักนิดนะครับ\nกรุณาเลือกประเภทอุปกรณ์ของคุณ:',
      quickReplyOptions: DEVICE_OPTIONS.map(o => ({ label: o.label, text: o.text })),
    };
  }

  // Awaiting service
  if (status === 'awaiting_service') {
    let matchedService = trimmed;
    const found = SERVICE_OPTIONS.find(s => s.text === trimmed || trimmed.includes(s.value));
    if (found) {
      matchedService = found.value;
    }

    return {
      nextStatus: 'awaiting_issue',
      nextData: { ...data, service_category: matchedService },
      replyText: `เลือกบริการ: ${matchedService} เรียบร้อยครับ 📋\n\nช่วยพิมพ์เล่าอาการ หรือปัญหาที่พบเพิ่มเติมสั้นๆ ให้หน่อยครับ (หรือถ่ายภาพ/คลิปอาการส่งมาได้เลยครับ)`,
    };
  }

  // Awaiting issue details
  if (status === 'awaiting_issue') {
    const issueText = kind === 'image' ? '[ลูกค้าแนบภาพอาการ]' : trimmed || 'ตรวจเช็กอาการทั่วไป';
    return {
      nextStatus: 'completed',
      nextData: {
        ...data,
        issue_description: issueText,
        completed_at: new Date().toISOString(),
      },
      replyText: '🎮 บันทึกข้อมูลเรียบร้อยแล้วครับ!\nช่างได้รับข้อมูลแล้ว และจะเข้ามาตรวจสอบพร้อมตอบกลับในแชตนี้สักครู่นะครับ ขอบคุณครับ 🙏',
    };
  }

  return {
    nextStatus: status,
    nextData: data,
    replyText: null,
  };
}

export function buildLineReplyPayload(transition: BotTransitionResult) {
  if (!transition.replyText) return [];

  const message: {
    type: 'text';
    text: string;
    quickReply?: { items: Array<{ type: 'action'; action: { type: 'message'; label: string; text: string } }> };
  } = {
    type: 'text',
    text: transition.replyText,
  };

  if (transition.quickReplyOptions && transition.quickReplyOptions.length > 0) {
    message.quickReply = {
      items: transition.quickReplyOptions.map(opt => ({
        type: 'action',
        action: {
          type: 'message',
          label: opt.label.slice(0, 20),
          text: opt.text.slice(0, 300),
        },
      })),
    };
  }

  return [message];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendLineReply(replyToken: string, messages: any[]): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token || !replyToken || !messages.length) return false;

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.error('sendLineReply error:', err);
    return false;
  }
}

export async function sendLinePushMessage(
  lineUserId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN is missing or empty' };
  if (!lineUserId?.trim() || !text?.trim()) return { ok: false, error: 'Invalid recipient or empty text' };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId.trim(),
        messages: [{ type: 'text', text: text.trim() }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
      const message = (body as { message?: string }).message || `LINE API error ${res.status}`;
      return { ok: false, error: message };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

