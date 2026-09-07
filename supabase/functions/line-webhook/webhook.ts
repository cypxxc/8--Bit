// Portable Web API implementation, shared by Next.js and the Supabase receiver.
export interface IncomingLineEvent {
  eventId: string; type: string; userId: string; sentAt: string;
  messageId?: string; kind?: string; text?: string; metadata?: Record<string, unknown>;
}
export interface ReceiverOptions {
  secret: string; destination: string;
  save: (event: IncomingLineEvent) => Promise<void>;
  verified: () => Promise<void>;
}
const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const str = (v: unknown, max = 100): string => typeof v === 'string' ? v.slice(0, max) : '';
export function normalizeEvent(value: unknown): IncomingLineEvent | null {
  const event = record(value), source = record(event.source);
  // One-to-one customers only. Group membership is not a customer identity.
  if (source.type !== 'user' || !/^U[a-f0-9]{32}$/.test(str(source.userId))) return null;
  if (!['message','follow','unfollow','unsend'].includes(str(event.type))) return null;
  if (!str(event.webhookEventId) || typeof event.timestamp !== 'number' || !Number.isFinite(event.timestamp))
    throw new Error('Invalid event');
  const result: IncomingLineEvent = {eventId: str(event.webhookEventId),type: str(event.type),
    userId: str(source.userId),sentAt: new Date(event.timestamp).toISOString()};
  if (event.type === 'unsend') {
    result.messageId = str(record(event.unsend).messageId);
    if (!result.messageId) throw new Error('Missing message');
  }
  if (event.type === 'message') {
    const m = record(event.message);
    result.messageId = str(m.id);
    if (!result.messageId) throw new Error('Missing message');
    result.kind = str(m.type,30) || 'other';
    result.text = str(m.text,10000);
    result.metadata = {};
    for (const key of ['fileName','stickerId','packageId','title','address']) {
      if (typeof m[key] === 'string') result.metadata[key] = str(m[key],500);
    }
    for (const key of ['fileSize','latitude','longitude']) {
      if (typeof m[key] === 'number' && Number.isFinite(m[key])) result.metadata[key] = m[key];
    }
    if (record(m.contentProvider).type === 'external') result.metadata.external = true;
  }
  return result;
}
export async function receiveWebhook(request: Request, options: ReceiverOptions): Promise<Response> {
  const reply = (status: number) => Response.json({ok:status === 200},{status,headers:{'Cache-Control':'no-store'}});
  if (request.method !== 'POST') return reply(405);
  if (!options.secret || !options.destination) return reply(503);
  const signature = request.headers.get('x-line-signature') || '';
  if (!/^[A-Za-z0-9+/]{43}=$/.test(signature)) return reply(401);
  const reader = request.body?.getReader();
  if (!reader) return reply(400);
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const {value,done} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 1_000_000) {await reader.cancel(); return reply(413);}
    chunks.push(value);
  }
  const raw = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) {raw.set(chunk,offset); offset += chunk.length;}
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(options.secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const sig = Uint8Array.from(atob(signature),c => c.charCodeAt(0));
  if (!(await crypto.subtle.verify('HMAC',key,sig,raw))) return reply(401);
  let events: IncomingLineEvent[];
  try {
    const data = record(JSON.parse(new TextDecoder().decode(raw)));
    if (data.destination !== options.destination) return reply(403);
    if (!Array.isArray(data.events) || data.events.length > 100) return reply(400);
    events = data.events.map(normalizeEvent).filter((e): e is IncomingLineEvent => e !== null);
  } catch {return reply(400);}
  try {
    for (const event of events) await options.save(event);
    await options.verified();
    return reply(200);
  } catch {return reply(503);}
}
