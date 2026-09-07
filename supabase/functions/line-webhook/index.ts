import { receiveWebhook } from './webhook.ts';

// The LINE HMAC signature authenticates requests before any database writes.
// No Supabase JWT is expected from LINE's servers.
const runtime = (globalThis as unknown as {Deno:{env:{get:(key:string)=>string|undefined};serve:(handler:(request:Request)=>Promise<Response>)=>void}}).Deno;
runtime.serve(async request => {
  const url = runtime.env.get('SUPABASE_URL')!;
  const keys = JSON.parse(runtime.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const key = keys.default || runtime.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const headers: Record<string,string> = {'Content-Type':'application/json',apikey:key};
  if (!keys.default) headers.Authorization = `Bearer ${key}`;
  async function write(path:string,payload:unknown,prefer='') {
    const response = await fetch(`${url}/rest/v1/${path}`,{method:'POST',headers:{...headers,Prefer:prefer},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Storage unavailable');
  }
  return receiveWebhook(request,{
    secret: runtime.env.get('LINE_CHANNEL_SECRET')?.trim() || '',
    destination: runtime.env.get('LINE_BOT_USER_ID')?.trim() || '',
    save: event => write('rpc/shop_receive_line',{p_event:event}),
    verified: () => write('line_inbox_state',{id:true,verified_at:new Date().toISOString()},'resolution=merge-duplicates')
  });
});
