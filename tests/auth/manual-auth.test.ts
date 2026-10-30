import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import { chromium, expect, type Browser, type Page } from '@playwright/test';
import { LoginPage as PcLogin } from '../../pages/web/pc/login.page';
import { LoginPage as MwLogin } from '../../pages/web/mw/login.page';
import { notifyManualAuth, waitForManualAuthentication } from '../../utils/manual-auth';

// 외부 사이트·실제 Slack에 접근하지 않는 브라우저 회귀 검사.
describe('사용자 로그인·본인인증 대기와 Slack 알림', { concurrency: false }, () => {
  let browser: Browser;
  let page: Page;
  let messages: string[];
  let threadTimestamps: Array<string | undefined>;
  const originalFetch = globalThis.fetch;
  const keys = ['LOGIN_ID', 'LOGIN_PW', 'SLACK_NOTIFICATIONS_ENABLED', 'SLACK_WEBHOOK_URL', 'SLACK_THREAD_TS'] as const;
  const originalEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  before(async () => { browser = await chromium.launch({ channel: 'chrome', headless: true }); });
  after(async () => { await browser.close(); });
  beforeEach(async () => {
    page = await browser.newPage();
    messages = [];
    threadTimestamps = [];
    process.env.LOGIN_ID = 'qa-test-id';
    process.env.LOGIN_PW = 'qa-test-password';
    process.env.SLACK_NOTIFICATIONS_ENABLED = 'true';
    process.env.SLACK_WEBHOOK_URL = 'https://slack.test.invalid/webhook';
    process.env.SLACK_THREAD_TS = '1234567890.123456';
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'https://slack.test.invalid/webhook');
      const body = JSON.parse(String(init?.body));
      messages.push(body.text);
      threadTimestamps.push(body.thread_ts);
      return new Response('ok', { status: 200 });
    };
  });
  afterEach(async () => {
    await page.close();
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  async function mockLogin(result: 'challenge' | 'certification' | 'authenticated') {
    let attempts = 0;
    await page.route('**/*', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/integrationLoginCheck')) {
        attempts++;
        await route.fulfill({ status: result === 'challenge' ? 428 : 200,
          contentType: 'application/json', body: JSON.stringify(result === 'challenge' ? { 'sec-cp-challenge': true } : { ok: true }) });
      } else if (path.endsWith('/loginPage')) {
        await route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<form onsubmit="event.preventDefault();fetch('/custord/web/api/customer/integrationLoginCheck',{method:'POST'}).then(r=>{if(r.ok)document.body.innerHTML='<span>인증요청</span>'})">
          <input placeholder="아이디"><input placeholder="비밀번호" type="password"><button><span>로그인</span></button></form>` });
      } else {
        await route.fulfill({ contentType: 'text/html; charset=utf-8', body: result === 'authenticated'
          ? '<button>로그아웃</button>' : '<a href="/custord/loginPage">로그인/회원 가입</a><a href="/custord/loginPage">로그인</a>' });
      }
    });
    return () => attempts;
  }

  for (const [platform, Login] of [['PC', PcLogin], ['MW', MwLogin]] as const) {
    test(`${platform}: 자동 로그인 실패 → 수동 로그인 → 본인인증 → 세션 저장`, async () => {
      const attempts = await mockLogin('challenge');
      const login = new Login(page);
      const saved: string[] = [];
      login.saveStorageState = async path => { saved.push(path); };
      const completion = login.ensureLoggedIn();
      await expect.poll(() => messages.length).toBe(1);
      assert.match(messages[0], /로그인 필요/);
      assert.deepEqual(saved, []);
      await page.setContent('<span>인증요청</span>');
      await expect.poll(() => messages.length).toBe(2);
      assert.match(messages[1], /본인인증 필요/);
      await page.waitForTimeout(400);
      assert.equal(messages.length, 2, '같은 단계에서 알림을 반복하지 않는다');
      assert.deepEqual(saved, []);
      await page.setContent('<button>로그아웃</button>');
      await completion;
      assert.equal(attempts(), 1, '자동 로그인은 한 번만 시도한다');
      assert.deepEqual(saved, [platform === 'PC' ? 'auth.json' : 'mw-auth.json']);
      assert.ok(messages.every(text => !text.includes('qa-test-id') && !text.includes('qa-test-password')));
      assert.ok(threadTimestamps.every(value => value === '1234567890.123456'));
    });
  }

  test('자동 로그인 후 본인인증만 필요하면 인증 알림만 보낸다', async () => {
    await mockLogin('certification');
    const login = new PcLogin(page);
    login.saveStorageState = async () => {};
    const completion = login.ensureLoggedIn();
    await expect.poll(() => messages.length).toBe(1);
    assert.match(messages[0], /본인인증 필요/);
    await page.setContent('<button>로그아웃</button>');
    await completion;
    assert.equal(messages.length, 1);
  });

  test('계정 설정이 없어도 실패하지 않고 수동 로그인을 기다린다', async () => {
    const attempts = await mockLogin('challenge');
    delete process.env.LOGIN_ID;
    delete process.env.LOGIN_PW;
    const login = new PcLogin(page);
    login.saveStorageState = async () => {};
    const completion = login.ensureLoggedIn();
    await expect.poll(() => messages.length).toBe(1);
    assert.match(messages[0], /로그인 필요/);
    await page.setContent('<button>로그아웃</button>');
    await completion;
    assert.equal(attempts(), 0);
  });

  test('유효한 세션은 로그인 시도·수동 알림 없이 재사용한다', async () => {
    const attempts = await mockLogin('authenticated');
    await new PcLogin(page).ensureLoggedIn();
    assert.equal(attempts(), 0);
    assert.deepEqual(messages, []);
  });

  test('로컬 실행에서는 Slack 알림을 보내지 않는다', async () => {
    delete process.env.SLACK_NOTIFICATIONS_ENABLED;
    await notifyManualAuth('PC', '로그인');
    assert.deepEqual(messages, []);
  });

  test('Slack 전송 실패가 사용자 인증 대기를 중단하지 않는다', async () => {
    globalThis.fetch = async () => new Response('unavailable', { status: 503 });
    await page.setContent('<span id="cert" hidden>인증요청</span><button id="logout" hidden>로그아웃</button>');
    const completion = waitForManualAuthentication(page, page.locator('#logout'), page.locator('#cert'), 'PC', true, 2_000);
    await page.locator('#logout').evaluate(node => { node.removeAttribute('hidden'); });
    await completion;
  });

  test('사용자 작업이 완료되지 않으면 통과하지 않고 제한시간에 실패한다', async () => {
    await page.setContent('<span id="cert" hidden>인증요청</span><button id="logout" hidden>로그아웃</button>');
    await assert.rejects(waitForManualAuthentication(page, page.locator('#logout'), page.locator('#cert'), 'PC', true, 200), /사용자가 로그인·본인인증을 완료해야/);
  });
});
