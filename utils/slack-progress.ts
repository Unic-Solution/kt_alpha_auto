import { request } from 'https';

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

function slackApi(method: string, body: Record<string, unknown>): Promise<{ ts?: string }> {
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

export async function postProgress(text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, text });
  return res.ts;
}

export function updateProgress(ts: string, text: string): void {
  slackApi('chat.update', { channel: CHANNEL_ID!, ts, text }).catch(() => {});
}
