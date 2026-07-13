import { request } from 'https';
import { readFileSync } from 'fs';
import { WebClient } from '@slack/web-api';

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const DEV_CHANNEL_ID = process.env.SLACK_DEV_CHANNEL_ID;

const slackClient = BOT_TOKEN ? new WebClient(BOT_TOKEN) : null;

/** Slack REST API 호출 (환경변수 미설정 시 무시) */
function slackApi(method: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!BOT_TOKEN) {
      console.warn('[Slack] SLACK_BOT_TOKEN 환경변수 없음');
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

/** 이전 테스트 실행의 Slack 스레드 ts를 .slack-ts 파일에서 읽기 */
export function readThreadTs(): string | undefined {
  try { return readFileSync('.slack-ts', 'utf-8').trim() || undefined; }
  catch { return undefined; }
}

/** 채널에 새 메시지를 보내고 ts(타임스탬프)를 반환 */
export async function postMessage(text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, text });
  return res.ts as string | undefined;
}

/** 스레드에 답글을 보내고 ts를 반환 */
export async function postThreadReply(threadTs: string, text: string): Promise<string | undefined> {
  const res = await slackApi('chat.postMessage', { channel: CHANNEL_ID!, thread_ts: threadTs, text });
  return res.ts as string | undefined;
}

/** 기존 메시지를 수정 (단계별 진행 상태 업데이트용) */
export function updateMessage(ts: string, text: string): void {
  slackApi('chat.update', { channel: CHANNEL_ID!, ts, text }).catch(() => {});
}

/** 스크린샷 파일을 Slack에 업로드 (실패 시 스레드에 첨부) */
export async function uploadScreenshot(file: Buffer, channelId: string, threadTs?: string, initialComment?: string): Promise<void> {
  if (!slackClient || !channelId) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (slackClient.filesUploadV2 as any)({
      channel_id: channelId,
      ...(threadTs ? { thread_ts: threadTs } : {}),
      ...(initialComment ? { initial_comment: initialComment } : {}),
      file,
      filename: 'screenshot.png',
    });
  } catch (e: any) {
    console.warn('[Slack] 파일 업로드 실패:', e.message);
  }
}

/** 개발자 채널의 스레드 ts를 .slack-dev-ts 파일에서 읽기 */
export function readDevThreadTs(): string | undefined {
  try { return readFileSync('.slack-dev-ts', 'utf-8').trim() || undefined; }
  catch { return undefined; }
}

/** 개발자 채널에 새 메시지를 보내고 ts를 반환 */
export async function postDevMessage(text: string): Promise<string | undefined> {
  if (!DEV_CHANNEL_ID) return undefined;
  const res = await slackApi('chat.postMessage', { channel: DEV_CHANNEL_ID, text });
  return res.ts as string | undefined;
}

/** 개발자 채널 스레드에 실패 상세 정보 답글 전송 */
export async function postDevThreadReply(threadTs: string, text: string): Promise<void> {
  if (!DEV_CHANNEL_ID) return;
  await slackApi('chat.postMessage', { channel: DEV_CHANNEL_ID, thread_ts: threadTs, text });
}

/** 개발자 채널 스레드에 스크린샷 업로드 */
export async function uploadDevScreenshot(file: Buffer, threadTs?: string, initialComment?: string): Promise<void> {
  if (!DEV_CHANNEL_ID) return;
  await uploadScreenshot(file, DEV_CHANNEL_ID, threadTs, initialComment);
}
