import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
async function fixture(options = {}) {
  const probe = createServer();
  await new Promise((r) => probe.listen(0, '127.0.0.1', r));
  const port = probe.address().port;
  await new Promise((r) => probe.close(r));
  const child = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '-H',
      '127.0.0.1',
      '-p',
      String(port),
    ],
    {
      env: {
        ...process.env,
        SITE_URL: options.siteUrl || '',
        PUBLIC_INDEXING: options.indexing ? 'true' : 'false',
        BOOKING_ENABLED: 'false',
        PRACTITIONER_KEY: '',
        NOTIFICATION_WEBHOOK_URL: '',
      },
      stdio: 'pipe',
      windowsHide: true,
    },
  );
  let output = '';
  child.stdout.on('data', (x) => (output += x));
  child.stderr.on('data', (x) => (output += x));
  const url = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(url);
      return {
        url,
        close: async () => {
          child.kill();
          await new Promise((r) => child.once('exit', r));
        },
      };
    } catch {
      if (child.exitCode !== null) throw Error(output);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  child.kill();
  throw Error('Next.js did not start: ' + output);
}
test('all public pages render; server does not expose source, secrets or metadata', async () => {
  const f = await fixture();
  try {
    for (const p of [
      '/',
      '/services/',
      '/about/',
      '/why-eudora/',
      '/online-physiotherapy/',
      '/areas/',
      '/faq/',
      '/contact/',
      '/testimonials/',
      '/feedback/',
      '/privacy/',
      '/terms/',
      '/practitioner/',
    ]) {
      const r = await fetch(f.url + p);
      assert.equal(r.status, 200, p);
      const html = await r.text();
      assert.equal((html.match(/<h1>/g) || []).length, 1, p);
      assert.match(html, /Eudora Movement House/);
      assert.match(html, /noindex,\s*nofollow/);
    }
    for (const p of [
      '/server.js',
      '/package.json',
      '/.env',
      '/.git/config',
      '/src/workspace.js',
      '/pages.json',
      '/missing/',
    ])
      assert.equal((await fetch(f.url + p)).status, 404, p);
    assert.match(
      await (await fetch(f.url + '/robots.txt')).text(),
      /Disallow: \//,
    );
  } finally {
    await f.close();
  }
});
test('production metadata uses configured canonical origin; private pages stay unindexed', async () => {
  const f = await fixture({
    siteUrl: 'https://eudora.example',
    indexing: true,
  });
  try {
    const html = await (await fetch(f.url + '/services/')).text();
    assert.match(html, /https:\/\/eudora.example\/services\//);
    assert.match(html, /index,\s*follow/);
    assert.match(
      await (await fetch(f.url + '/practitioner/')).text(),
      /noindex,\s*nofollow/,
    );
    assert.match(
      await (await fetch(f.url + '/sitemap.xml')).text(),
      /<loc>https:\/\/eudora.example\/services\/<\/loc>/,
    );
  } finally {
    await f.close();
  }
});

test('Next.js routes run booking validation and protect practitioner APIs', async () => {
  const f = await fixture();
  try {
    assert.equal(
      (await fetch(f.url + '/api/practitioner/workspace')).status,
      401,
    );
    assert.equal(
      (
        await fetch(f.url + '/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(f.url + '/api/bookings', {
          method: 'POST',
          headers: {
            Origin: 'https://other.example',
            'Content-Type': 'application/json',
          },
          body: '{}',
        })
      ).status,
      403,
    );
  } finally {
    await f.close();
  }
});

test('same-origin browser submissions are accepted through Next.js', async () => {
  const f = await fixture();
  try {
    const r = await fetch(f.url + '/api/bookings/', {
      method: 'POST',
      headers: { Origin: f.url, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(r.status, 400);
    const page = await fetch(f.url + '/contact/');
    const html = await page.text();
    assert.match(html, /<option>7:00 AM–10:00 AM<\/option>/);
    assert.match(page.headers.get('content-security-policy'), /nonce-/);
    assert.match(html, /nonce="[^"]+"/);
  } finally {
    await f.close();
  }
});
