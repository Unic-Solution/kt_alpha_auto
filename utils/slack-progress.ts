import { request } from 'https';
import { readFileSync } from 'fs';
import { WebClient } from '@slack/web-api';

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const slackClient = BOT_TOKEN ? new WebClient(BOT_TOKEN) : null;

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

export function readThreadTs(): string | undefined {
  try { return readFileSync('.slack-ts', 'utf-8').trim() || undefined; }
  catch { return undefined; }
}

export async function postMessage(text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, text });
  return res.ts as string | undefined;
}

export async function postThreadReply(threadTs: string, text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, thread_ts: threadTs, text });
  return res.ts as string | undefined;
}

export function updateMessage(ts: string, text: string): void {
  slackApi('chat.update', { channel: CHANNEL_ID!, ts, text }).catch(() => {});
}

export async function uploadScreenshot(file: Buffer, threadTs?: string): Promise<void> {
  if (!slackClient || !CHANNEL_ID) {
    console.warn('[Slack] uploadScreenshot 스킵: slackClient=', !!slackClient, 'CHANNEL_ID=', !!CHANNEL_ID);
    return;
  }
  try {
    console.log('[Slack] uploadScreenshot 시작: fileSize=', file.length, 'threadTs=', threadTs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (slackClient.filesUploadV2 as any)({
      channel_id: CHANNEL_ID,
      ...(threadTs ? { thread_ts: threadTs } : {}),
      file,
      filename: 'screenshot.png',
    });
    console.log('[Slack] uploadScreenshot 완료:', JSON.stringify(result));
  } catch (e: any) {
    console.warn('[Slack] 파일 업로드 실패:', e.message);
    if (threadTs) postThreadReply(threadTs, `[디버그] 스크린샷 업로드 실패: ${e.message}`).catch(() => {});
  }
}
