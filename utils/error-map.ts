const ERROR_MAP: [RegExp, string][] = [
  [/TimeoutError|Timeout.*exceeded/, '요소를 찾지 못했거나 페이지 응답이 너무 느렸습니다'],
  [/expected true but received false/, '검증 조건을 만족하지 못했습니다'],
  [/ERR_ABORTED|interrupted by another navigation/, '페이지 이동이 중단되었습니다'],
  [/net::ERR_|NS_ERROR_/, '네트워크 오류가 발생했습니다'],
  [/Navigation failed|navigation/, '페이지 이동에 실패했습니다'],
  [/Target closed|browser has been closed|context or browser/, '브라우저 또는 페이지가 예기치 않게 종료되었습니다'],
  [/intercepts pointer events|obscures it/, '다른 요소가 가리고 있어 클릭할 수 없습니다'],
  [/out of viewport/, '요소가 화면 밖에 있습니다'],
  [/detached from document|not attached to a Document|Element is not attached/, '요소가 DOM에서 제거되었습니다'],
  [/detached|Frame was detached/, '요소 또는 iframe이 페이지에서 사라졌습니다'],
  [/not visible/, '요소가 화면에 표시되지 않습니다'],
  [/not enabled/, '요소가 비활성화 상태입니다'],
  [/strict mode violation|resolved to/, '동일한 요소가 여러 개 발견되었습니다'],
  [/뷰포트 내에 클릭 가능한 요소를 찾을 수 없음/, '화면에 클릭 가능한 요소가 없습니다'],
  [/Cannot read properties of|TypeError/, '스크립트 오류가 발생했습니다'],
];

/** 에러 메시지를 패턴 매칭으로 한글 설명으로 변환 */
export function toFriendlyError(errorMsg: string): string {
  return ERROR_MAP.find(([pattern]) => pattern.test(errorMsg))?.[1] ?? '예기치 않은 오류가 발생했습니다';
}

/** 스택 트레이스에서 실패한 page 메서드명을 추출 (예: isAllNavItemsVisible > click) */
export function extractFailedMethod(error: unknown): string | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined;
  const lines = error.stack.split('\n');

  const pageLine = lines.find(l => l.includes('.page.ts') && !l.includes('BasePage.ts'));
  const baseLine = lines.find(l => l.includes('BasePage.ts'));

  const pageMethod = pageLine?.match(/at \w+\.(\w+)/)?.[1];
  const baseMethod = baseLine?.match(/at \w+\.(\w+)/)?.[1];

  if (pageMethod && baseMethod) return `${pageMethod} > ${baseMethod}`;
  return pageMethod ?? baseMethod;
}
