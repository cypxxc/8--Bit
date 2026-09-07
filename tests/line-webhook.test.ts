import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {receiveWebhook,normalizeEvent,type IncomingLineEvent} from '../lib/line/webhook';
const secret='test-signature-key',destination='U'+'a'.repeat(32);
const event={type:'message',webhookEventId:'event-1',timestamp:Date.now(),source:{type:'user',userId:'U'+'b'.repeat(32)},message:{id:'123',type:'text',text:'ทดสอบ'}};
function request(payload:unknown,signingSecret=secret) {
  const body=JSON.stringify(payload);
  return new Request('https://shop.example/api/line/webhook',{method:'POST',body,headers:{'x-line-signature':createHmac('sha256',signingSecret).update(body).digest('base64')}});
}
test('signature, destination and raw bytes checked before persistence',async()=>{
  let writes=0;const options={secret,destination,save:async()=>{writes++;},verified:async()=>{}};
  assert.equal((await receiveWebhook(request({destination,events:[event]},'wrong'),options)).status,401);
  assert.equal((await receiveWebhook(request({destination:'other',events:[event]}),options)).status,403);
  assert.equal(writes,0);
  assert.equal((await receiveWebhook(request({destination,events:[event]}),options)).status,200);
  assert.equal(writes,1);
});
test('LINE verification accepts empty events; missing configuration fails closed',async()=>{
  let verified=0;const options={secret,destination,save:async()=>{},verified:async()=>{verified++;}};
  assert.equal((await receiveWebhook(request({destination,events:[]}),options)).status,200);
  assert.equal(verified,1);
  assert.equal((await receiveWebhook(request({destination,events:[]}),{...options,secret:''})).status,503);
});
test('failed persistence returns retriable error',async()=>{
  assert.equal((await receiveWebhook(request({destination,events:[event]}),{secret,destination,save:async()=>{throw Error('offline');},verified:async()=>{}})).status,503);
});
test('customer identities remain separate; groups ignored; only selected fields retained',()=>{
  assert.equal(normalizeEvent({...event,source:{type:'group',groupId:'g',userId:event.source.userId}}),null);
  const normalized=normalizeEvent({...event,replyToken:'secret',message:{...event.message,unknown:'not retained'}}) as IncomingLineEvent;
  assert.equal(normalized.userId,event.source.userId);
  assert.equal(JSON.stringify(normalized).includes('secret'),false);
  assert.equal(JSON.stringify(normalized).includes('not retained'),false);
  assert.equal(normalizeEvent({...event,type:'unsend',unsend:{messageId:'123'}})?.messageId,'123');
});
