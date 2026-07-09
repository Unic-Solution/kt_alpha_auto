import { request } from 'https';
import { existsSync, readFileSync } from 'fs';

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

function slackApi(method: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!BOT_TOKEN || !CHANNEL_ID) {
      console.warn('[Slack] SLACK_BOT_TOKEN 또는 SLACK_CHANNEL_ID 환경변수 없음');
      resolve({});
      return;
    }
    const payload = JSON.stringify(body);
    const req = request(
      {
        hostname: 'slack.com',
        path: `/api/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.ok) console.warn(`[Slack] ${method} 실패:`, parsed.error);
            resolve(parsed);
          } catch {
            resolve({});
          }
        });
      },
    );
    req.on('error', (e) => { console.warn('[Slack] 요청 오류:', e.message); resolve({}); });
    req.write(payload);
    req.end();
  });
}

function slackFormPost(method: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!BOT_TOKEN) { resolve({}); return; }
    const body = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const req = request(
      {
        hostname: 'slack.com',
        path: `/api/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${BOT_TOKEN}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.ok) console.warn(`[Slack] ${method} 실패:`, parsed.error);
            resolve(parsed);
          } catch {
            resolve({});
          }
        });
      },
    );
    req.on('error', (e) => { console.warn('[Slack] 요청 오류:', e.message); resolve({}); });
    req.write(body);
    req.end();
  });
}

function uploadRaw(uploadUrl: string, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = new URL(uploadUrl);
    const req = request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': data.length,
        },
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export function readThreadTs(): string | undefined {
  try { return readFileSync('.slack-ts', 'utf-8').trim() || undefined; }
  catch { return undefined; }
}

export async function postMessage(text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, text });
  return res.ts as string | undefined;
}

export async function getLatestMessageTs(): Promise<string | undefined> {
  const res = await slackApi('conversations.history', { channel: CHANNEL_ID!, limit: 1 });
  const messages = res.messages as Array<{ ts: string }> | undefined;
  return messages?.[0]?.ts;
}

export async function postThreadReply(threadTs: string, text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, thread_ts: threadTs, text });
  return res.ts as string | undefined;
}

export function updateMessage(ts: string, text: string): void {
  slackApi('chat.update', { channel: CHANNEL_ID!, ts, text }).catch(() => {});
}

export async function uploadScreenshot(fileOrPath: Buffer | string, title: string, threadTs?: string): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID) return;
  try {
    const fileContent = typeof fileOrPath === 'string'
      ? (existsSync(fileOrPath) ? readFileSync(fileOrPath) : null)
      : fileOrPath;
    if (!fileContent) return;

    // 1단계: 업로드 URL 발급
    const urlRes = await slackFormPost('files.getUploadURLExternal', {
      filename: 'screenshot.png',
      length: String(fileContent.length),
    });
    if (!urlRes.ok || !urlRes.upload_url || !urlRes.file_id) {
      console.warn('[Slack] getUploadURLExternal 실패:', urlRes.error);
      return;
    }

    // 2단계: 파일 직접 업로드
    await uploadRaw(urlRes.upload_url as string, fileContent);

    // 3단계: 업로드 완료 및 채널 공유
    const completeBody: Record<string, unknown> = {
      files: [{ id: urlRes.file_id as string, title }],
      channel_id: CHANNEL_ID,
    };
    if (threadTs) completeBody.thread_ts = threadTs;
    const completeRes = await slackApi('files.completeUploadExternal', completeBody);
    if (!completeRes.ok) console.warn('[Slack] completeUploadExternal 실패:', completeRes.error);
  } catch (e: any) {
    console.warn('[Slack] 파일 업로드 오류:', e.message);
  }
}
