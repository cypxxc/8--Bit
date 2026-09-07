import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3005';
let checks = 0;
for (const path of ['/api/admin/auth','/api/admin/jobs','/api/admin/services','/api/admin/summary','/api/admin/notifications','/api/admin/inbox','/api/admin/inbox/messages?room=00000000-0000-4000-8000-000000000001','/api/admin/inbox/content?id=1']) {
  const res=await fetch(base+path);
  assert.equal(res.status,401,path);
  assert.match(res.headers.get('cache-control'),/no-store/);
  checks++;
}
for (const [path,method] of [['/api/admin/jobs','POST'],['/api/admin/jobs','PATCH'],['/api/admin/services','PATCH'],['/api/admin/notifications','POST'],['/api/admin/inbox/messages','PATCH']]) {
  const res=await fetch(base+path,{method,headers:{origin:base,'content-type':'application/json'},body:'{}'});
  assert.equal(res.status,401,path);
  checks++;
}
for (const path of ['/api/admin/auth','/api/admin/setup','/api/ticket']) {
  const res=await fetch(base+path,{method:'POST',headers:{origin:'https://attacker.invalid','content-type':'application/json'},body:'{}'});
  assert.equal(res.status,403,path);
  checks++;
}
for (const [type,body,status] of [['application/json-evil','{}',415],['application/json','"'+'x'.repeat(20001)+'"',413]]) {
  const res=await fetch(base+'/api/ticket',{method:'POST',headers:{origin:base,'content-type':type},body});
  assert.equal(res.status,status);
  checks++;
}
const nonces=[];
for (const path of ['/','/','/admin/login','/admin/setup']) {
  const res=await fetch(base+path);
  const csp=res.headers.get('content-security-policy');
  assert.match(csp,/script-src[^;]*'strict-dynamic'/);
  assert.doesNotMatch(csp,/script-src[^;]*'unsafe-(inline|eval)'/);
  const nonce=csp.match(/'nonce-([^']+)'/)[1];
  nonces.push(nonce);
  const html=await res.text();
  const scripts=html.match(/<script\b[^>]*>/g)||[];
  assert.ok(scripts.length>0);
  assert.ok(scripts.every(tag=>tag.includes(`nonce="${nonce}"`)));
  assert.match(res.headers.get('cache-control'),/no-store/);
  assert.equal(res.headers.get('x-frame-options'),'DENY');
  checks++;
}
assert.equal(new Set(nonces).size,nonces.length);
const forged=await fetch(base+'/api/line/webhook',{method:'POST',headers:{'content-type':'application/json','x-line-signature':Buffer.alloc(32).toString('base64')},body:'{"events":[]}'});
assert.equal(forged.status,401);
checks++;
console.log(`Passed ${checks} security HTTP checks; no customer records or LINE messages created.`);
