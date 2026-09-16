import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, validateBooking, validateInvoice } from '../src/backend.js';
import { createServer } from 'node:http';
function createApp(options) {
  const handle = createApi({ ...options });
  return createServer(async (req, res) => {
    const origin = 'http://' + req.headers.host;
    const request = new Request(origin + req.url, {
      method: req.method,
      headers: req.headers,
      ...(!['GET', 'HEAD'].includes(req.method)
        ? { body: req, duplex: 'half' }
        : {}),
    });
    const response = await handle(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
}
async function fixture(options = {}) {
  const server = createApp(options);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
const date = new Date(Date.now() + 86400e3 * 3);
while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
const valid = {
  name: 'Test Person',
  age: 30,
  phone: '+919999999999',
  location: 'Test locality',
  type: 'home',
  date: date.toISOString().slice(0, 10),
  time: '7:00 AM–10:00 AM',
  consent: true,
};
const post = (url, data, key = 'test-request-00000001', headers = {}) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
      ...headers,
    },
    body: JSON.stringify(data),
  });
test('booking validates consent, dates, ranges and contact details', () => {
  assert.ok(validateBooking(valid).data);
  for (const change of [
    { consent: false },
    { age: 0 },
    { age: 1.2 },
    { phone: '123' },
    { date: '2027-02-30' },
    { date: '2020-01-01' },
    { type: 'clinic' },
    { time: 'midnight' },
  ])
    assert.ok(validateBooking({ ...valid, ...change }).error);
});
test('invoice validation requires a billed person, date and service line', () => {
  const validInvoice = {
    bill_to_name: 'Test Patient',
    bill_to_phone: '+919999999999',
    bill_to_location: 'KR Puram',
    invoice_date: '2026-09-16',
    due_date: '2026-09-23',
    amount_paid: 0,
    line_items: [
      {
        description: 'Home visit',
        qty: 1,
        rate: 1500,
        service_date: '2026-09-16',
      },
    ],
  };
  assert.ok(validateInvoice(validInvoice).data);
  assert.ok(validateInvoice({ ...validInvoice, line_items: [] }).error);
  assert.ok(validateInvoice({ ...validInvoice, bill_to_name: 'A' }).error);
  assert.ok(validateInvoice({ ...validInvoice, due_date: '2026-09-01' }).error);
});
test('unconfigured forms never report false success; cross-origin requests are rejected', async () => {
  const f = await fixture();
  try {
    assert.equal((await post(f.url + '/api/bookings', valid)).status, 503);
    assert.equal(
      (await post(f.url + '/api/bookings', { ...valid, consent: false }))
        .status,
      400,
    );
    assert.equal(
      (
        await post(f.url + '/api/bookings', valid, undefined, {
          Origin: 'https://other.example',
        })
      ).status,
      403,
    );
  } finally {
    await f.close();
  }
});
test('notification success, concurrent deduplication and conflicting retries', async () => {
  const deliveries = [];
  const f = await fixture({
    enabled: true,
    webhook: 'https://notification.example',
    fetch: async (url, opts) => {
      deliveries.push(JSON.parse(opts.body));
      return { ok: true };
    },
  });
  try {
    const results = await Promise.all([
      post(f.url + '/api/bookings', valid),
      post(f.url + '/api/bookings', valid),
    ]);
    assert.deepEqual(
      results.map((x) => x.status),
      [200, 200],
    );
    assert.equal(deliveries.length, 1);
    assert.equal(deliveries[0].event, 'consultation.requested');
    assert.equal(
      (await post(f.url + '/api/bookings', { ...valid, name: 'Changed name' }))
        .status,
      409,
    );
  } finally {
    await f.close();
  }
});
test('notification failure returns an error and allows same-key retry', async () => {
  let attempt = 0;
  const f = await fixture({
    enabled: true,
    webhook: 'https://notification.example',
    fetch: async () => ({ ok: ++attempt > 1 }),
  });
  try {
    assert.equal((await post(f.url + '/api/bookings', valid)).status, 502);
    assert.equal((await post(f.url + '/api/bookings', valid)).status, 200);
    assert.equal(attempt, 2);
  } finally {
    await f.close();
  }
});
test('feedback validates and forwards privately', async () => {
  const sent = [];
  const f = await fixture({
    enabled: true,
    webhook: 'https://notification.example',
    fetch: async (u, o) => {
      sent.push(JSON.parse(o.body));
      return { ok: true };
    },
  });
  try {
    assert.equal(
      (
        await post(f.url + '/api/feedback', {
          rating: 5,
          message: 'Helpful session',
          consent: false,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await post(f.url + '/api/feedback', {
          rating: 5,
          message: 'Helpful session',
          consent: true,
        })
      ).status,
      200,
    );
    assert.equal(sent[0].event, 'feedback.received');
  } finally {
    await f.close();
  }
});
test('practitioner tools require a session; logout requires CSRF and invalidates it', async () => {
  const f = await fixture({ key: 'test-only-practitioner-key-12345' });
  try {
    assert.equal(
      (await fetch(f.url + '/api/practitioner/workspace')).status,
      401,
    );
    assert.equal(
      (await post(f.url + '/api/practitioner/login', { key: 'wrong' })).status,
      401,
    );
    const login = await post(f.url + '/api/practitioner/login', {
      key: 'test-only-practitioner-key-12345',
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const r = await fetch(f.url + '/api/practitioner/workspace', {
      headers: { Cookie: cookie },
    });
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.match(data.html, /Exercise chart/);
    assert.equal(
      (
        await post(f.url + '/api/practitioner/logout', {}, undefined, {
          Cookie: cookie,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await post(f.url + '/api/practitioner/logout', {}, undefined, {
          Cookie: cookie,
          'X-CSRF-Token': data.csrf,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await fetch(f.url + '/api/practitioner/workspace', {
          headers: { Cookie: cookie },
        })
      ).status,
      401,
    );
  } finally {
    await f.close();
  }
});

test('invalid JSON, oversized payloads and content types are rejected', async () => {
  const f = await fixture();
  try {
    for (const [body, type, status] of [
      ['{', 'application/json', 400],
      ['x'.repeat(17000), 'application/json', 413],
      ['{}', 'text/plain', 415],
    ]) {
      const r = await fetch(f.url + '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': type },
        body,
      });
      assert.equal(r.status, status);
    }
  } finally {
    await f.close();
  }
});
