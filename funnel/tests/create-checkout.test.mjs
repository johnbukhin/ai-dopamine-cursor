/* Issue #98 — create-checkout's avoidable round trips.
   No Stripe key here, so the SDK is mocked and the call sequence itself is
   what gets asserted: what is called, in what order, and what overlaps. */
import { mock } from 'node:test';

const LAG = 40;                 // stand-in for a Stripe round trip
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let calls;
function rec(name, ret) {
  return async (...args) => {
    const at = calls.length;
    calls.push({ name, args, start: Date.now(), end: null });
    await wait(LAG);
    calls[at].end = Date.now();
    return typeof ret === 'function' ? ret(...args) : ret;
  };
}

function makeStripe({ customerExists, schedules }) {
  return {
    customers: {
      list:   rec('customers.list',   () => ({ data: customerExists ? [{ id: 'cus_1' }] : [] })),
      create: rec('customers.create', () => ({ id: 'cus_new' })),
      update: rec('customers.update', () => ({})),
    },
    subscriptionSchedules: {
      list:   rec('schedules.list',   () => ({ data: schedules })),
      cancel: rec('schedules.cancel', () => ({})),
      create: rec('schedules.create', () => ({
        id: 'sched_1',
        subscription: { id: 'sub_1', latest_invoice: { id: 'in_1' } },
      })),
    },
    invoices: {
      finalizeInvoice: rec('invoices.finalize', () => ({
        status: 'open',
        payment_intent: { id: 'pi_1', client_secret: 'cs_test_1' },
      })),
    },
    paymentIntents: { update: rec('pi.update', () => ({})) },
  };
}

let stripeCfg = { customerExists: false, schedules: [] };
mock.module('stripe', {
  defaultExport: class { constructor() { return makeStripe(stripeCfg); } },
});

Object.assign(process.env, {
  STRIPE_SECRET_KEY: 'sk_test', STRIPE_PRICE_INTRO_1MONTH: 'price_i',
  STRIPE_PRICE_REGULAR_MONTHLY: 'price_r',
});

const { default: handler } = await import('../api/create-checkout.js');

function res() {
  const o = { code: null, body: null, headers: {} };
  o.setHeader = (k, v) => { o.headers[k] = v; };
  o.status = (c) => { o.code = c; return o; };
  o.json = (b) => { o.body = b; return o; };
  o.end = () => o;
  return o;
}

async function run(cfg, body) {
  stripeCfg = cfg;
  calls = [];
  const r = res();
  await handler({ method: 'POST', headers: {}, body }, r);
  return r;
}

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };
const names = () => calls.map((c) => c.name);
const overlap = (a, b) => {
  const x = calls.find((c) => c.name === a), y = calls.find((c) => c.name === b);
  return x && y && x.start < y.end && y.start < x.end;
};

const PAYLOAD = { tierId: '1_month', email: 'test@testtest1.com', currency: 'eur' };
const OPEN = [
  { id: 'ss_1', status: 'active' },
  { id: 'ss_2', status: 'not_started' },
  { id: 'ss_3', status: 'active' },
  { id: 'ss_4', status: 'released' },   // must be left alone
];

console.log('\n[a first-time buyer is not billed a round trip for an answer we know]');
{
  const r = await run({ customerExists: false, schedules: [] }, { ...PAYLOAD, fbp: 'fb.1.2.3' });
  ok(!names().includes('schedules.list'),
    `no schedule scan for a customer created one line earlier (saw: ${names().join(' → ')})`);
  ok(!names().includes('customers.update'),
    'no metadata update — create already carried it');
  ok(r.code === 200 && r.body.clientSecret === 'cs_test_1', 'still returns a usable clientSecret');
}

console.log('\n[a returning buyer still gets their stale schedules cancelled]');
{
  await run({ customerExists: true, schedules: OPEN }, { ...PAYLOAD, fbp: 'fb.1.2.3' });
  const cancelled = calls.filter((c) => c.name === 'schedules.cancel').map((c) => c.args[0]);
  ok(cancelled.length === 3, `three open schedules cancelled (got ${cancelled.length})`);
  ok(!cancelled.includes('ss_4'), 'a released schedule is left alone');
  ok(names().indexOf('schedules.cancel') < names().indexOf('schedules.create'),
    'cancels finish before the new schedule opens');
}

console.log('\n[independent work overlaps instead of queueing]');
{
  await run({ customerExists: true, schedules: OPEN }, { ...PAYLOAD, fbp: 'fb.1.2.3' });
  ok(overlap('customers.update', 'schedules.list'),
    'the metadata refresh runs alongside the schedule scan, not after it');

  const c = calls.filter((x) => x.name === 'schedules.cancel');
  const span = Math.max(...c.map((x) => x.end)) - Math.min(...c.map((x) => x.start));
  ok(span < LAG * 2, `three cancels cost one round trip, not three (span ${span}ms, one trip ${LAG}ms)`);
}

console.log('\n[the shape of the response is untouched]');
{
  const r = await run({ customerExists: true, schedules: [] }, PAYLOAD);
  const b = r.body;
  ok(b.customerId === 'cus_1' && b.subscriptionId === 'sub_1' && b.scheduleId === 'sched_1'
     && b.planLabel === '1-Month Plan' && b.currency === 'eur',
     'customerId, subscriptionId, scheduleId, planLabel and currency all still returned');
  ok(names().includes('pi.update'),
    'setup_future_usage is still applied — the upsell depends on the saved card');
}

console.log('\n[the guards in front of it all still hold]');
{
  const r1 = await run({ customerExists: false, schedules: [] }, { tierId: '1_month' });
  ok(r1.code === 400, 'a missing email is rejected before Stripe is touched');
  const r2 = await run({ customerExists: false, schedules: [] }, { ...PAYLOAD, tierId: 'nope' });
  ok(r2.code === 400, 'an unknown plan is rejected');
  const r3 = await run({ customerExists: false, schedules: [] }, { ...PAYLOAD, currency: 'zzz' });
  ok(r3.body.currency === 'eur', 'an unsupported currency still falls back to eur');
}

console.log(bad === 0 ? '\nPASS' : `\nFAIL (${bad})`);
process.exit(bad === 0 ? 0 : 1);
