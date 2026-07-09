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

export async function uploadScreenshot(filePath: string, title: string, threadTs?: string): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID || !existsSync(filePath)) return;
  try {
    const fileContent = readFileSync(filePath);
    const formData = new FormData();
    formData.append('channels', CHANNEL_ID);
    formData.append('title', title);
    formData.append('filename', 'screenshot.png');
    if (threadTs) formData.append('thread_ts', threadTs);
    formData.append('file', new Blob([fileContent], { type: 'image/png' }), 'screenshot.png');

    const res = await fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${BOT_TOKEN}` },
      body: formData,
    });
    const data = await res.json() as { ok: boolean; error?: string };
    if (!data.ok) console.warn('[Slack] 파일 업로드 실패:', data.error);
  } catch (e: any) {
    console.warn('[Slack] 파일 업로드 오류:', e.message);
  }
}
