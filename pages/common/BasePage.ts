import { Page } from '@playwright/test';
import { CommonLocators } from './common.locators';

export class BasePage {
  constructor(protected page: Page) {}

  getPage(): Page {
    return this.page;
  }

  /** 모달 확인 */
  async isModalVisible(): Promise<boolean> {
    return await this.isVisible(CommonLocators.modal.modal);
  }

  /** 공통 팝업 모달 닫기 (모달이 없으면 무시) */
  async closeModal() {
    const buttons = this.page.locator(CommonLocators.modal.closeBtn);
    await buttons.first().waitFor({ state: 'visible', timeout: 750 }).catch(() => {});
    while (await buttons.filter({ visible: true }).count()) {
      const button = buttons.filter({ visible: true }).first();
      await button.click();
      await button.waitFor({ state: 'hidden', timeout: 1_000 }).catch(() => {});
    }
  }

  /** 홈페이지로 이동 */
  async goToHome() {
    await this.goToUrl(CommonLocators.urls.homePage);
    await this.closeModal();
  }

  /** 상단 기프티쇼 버튼 클릭 */
    async clickGiftShowButton() {
      await this.goToHome();
      await this.click(CommonLocators.button.giftShowButton);
      await this.closeModal();
    }

  /** 메인페이지 전환 대기 */
  async waitMainPage() {
    await this.waitForURLContains(CommonLocators.urls.homePage);
  }

  /** 메인페이지 이동 확인 */
  async isMainPage(): Promise<boolean> {
    return this.urlContains(CommonLocators.urls.homePage);
  }

  /** 확인 버튼 클릭 */
  async clickConfirmButton() {
    await this.click(CommonLocators.modal.confirmButton);
  }

  /** 지정한 URL로 이동 */
  async goToUrl(url: string) {
    try {
      await this.page.goto(url);
    } catch (e: any) {
      if (e.message?.includes('ERR_ABORTED') || e.message?.includes('interrupted by another navigation')) {
        await this.page.goto(url);
      } else throw e;
    }
  }

  /** 페이지 새로고침 */
  async reload() {
    await this.page.reload();
  }

  /** 요소 단일 클릭 */
  async click(selector: string, force = false, timeout = 3) {
    await this.waitForElement(selector, timeout);
    await this.page.locator(selector).first().click({ force });
  }

  /** index번째 요소 클릭 */
  async nthClick(selector: string, index: number) {
    await this.page.locator(selector).nth(index).click();
  }

  /** 마지막 요소 클릭 */
  async lastClick(selector: string) {
    await this.page.locator(selector).last().click();
  }

  /** 요소 더블 클릭 */
  async doubleClick(selector: string) {
    await this.page.locator(selector).dblclick();
  }

  /** 요소 개수 추출 */
  async count(selector: string): Promise<number> {
    await this.waitForElement(selector, 5).catch(() => {});
    return await this.page.locator(selector).count();
  }

  /** input 요소에 텍스트를 키 이벤트로 한 글자씩 입력 (React controlled input 대응) */
  async pressSequentially(selector: string, text: string) {
    await this.page.locator(selector).pressSequentially(text);
  }

  /** input 요소의 값 초기화 */
  async clear(selector: string) {
    await this.page.locator(selector).clear();
  }

  /** select 요소에서 옵션 선택 (value, label, index 모두 가능) */
  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }

  /** 요소에 마우스 호버 */
  async hover(selector: string) {
    await this.page.locator(selector).hover();
  }

  /** 키보드 키 입력 (예: 'Enter', 'Tab', 'Escape') */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /** 요소의 텍스트 내용 반환 */
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).innerText();
  }

  /** index번째 요소의 텍스트 내용 반환 */
  async getIndexText(selector: string, index: number): Promise<string> {
    return await this.page.locator(selector).nth(index).innerText();
  }

  /** 요소의 지정 attribute 값 반환 */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  /** input 요소의 현재 입력값 반환 */
  async getValue(selector: string): Promise<string> {
    return await this.page.locator(selector).inputValue();
  }

  /** input 요소의 값이 비어있는지 여부 반환 */
  async isEmpty(selector: string): Promise<boolean> {
    return (await this.getValue(selector)) === '';
  }

  /** 문자열에서 숫자만 추출하여 number로 반환 (숫자 없으면 false) */
  extractNumber(text: string): number | false {
    const digits = text.replace(/\D/g, '');
    return digits.length > 0 ? Number(digits) : false;
  }

  /** 요소가 화면에 보이는지 여부 반환 */
  async isVisible(selector: string): Promise<boolean> {
    await this.waitForElement(selector, 3).catch(() => {});
    return await this.page.locator(selector).isVisible();
  }

  /** 요소가 활성화(enabled) 상태인지 여부 반환 */
  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  /** 체크박스 / 라디오 버튼의 체크 여부 반환 */
  async isChecked(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isChecked();
  }

  /** 요소가 visible 상태가 될 때까지 대기 */
  async waitForElement(selector: string, seconds: number = 10) {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: seconds * 1000 });
  }

  /** 요소가 DOM에서 사라질 때까지 대기 */
  async waitForHidden(selector: string, seconds?: number) {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout: seconds ? seconds * 1000 : undefined });
  }

  /** URL에 특정 문자열이 포함될 때까지 대기 */
  async waitForURLContains(path: string) {
    await this.page.waitForURL(url => url.href.includes(path));
  }

  /** 페이지 로드 완료까지 대기 (load / domcontentloaded / networkidle) */
  async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.waitForLoadState(state);
  }

  /** 요소가 뷰포트 내로 스크롤될 때까지 이동 */
  async scrollIntoView(selector: string) {
    await this.page.locator(selector).first().scrollIntoViewIfNeeded();
  }

  /** 페이지 최하단으로 스크롤 */
  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /** 현재 페이지의 URL 반환 */
  getCurrentURL(): string {
    return this.page.url();
  }

  /** 현재 URL이 특정 문자열을 포함하는지 여부 반환 */
  async urlContains(url: string, text: string = url): Promise<boolean> {
    await this.waitForURLContains(url);
    return this.getCurrentURL().includes(text);
  }

  /** 여러 요소 중 visible 상태인 첫 번째 요소 클릭 */
  async clickVisible(selector: string) {
    await this.page.locator(selector).filter({ visible: true }).first().click();
  }

  /** 뷰포트 내에 실제로 노출된 첫 번째 요소 클릭 (캐러셀 등 transform으로 숨겨진 요소 대응) */
  async clickFirstInViewport(selector: string) {
    const locator = this.page.locator(selector);
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const el = locator.nth(i);
      const isInViewport = await el.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const vw = window.innerWidth || document.documentElement.clientWidth;
        return centerX > vw / 3 && centerX < (vw * 2) / 3;
      });
      if (isInViewport) {
        await el.click({ force: true });
        return;
      }
    }
  }

  /** 활성화된 첫 번째 요소 클릭 (비활성화 건너뜀) */
  async clickFirstEnabled(selector: string) {
    const count = await this.count(selector);
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      const option = this.page.locator(selector).nth(i);
      if (await option.isEnabled() && await option.isVisible()) {
        await option.click();
        return;
      }
    }
  }

  /** 지정한 시간(초)만큼 대기 */
  async wait(seconds: number) {
    await this.page.waitForTimeout(seconds * 1000);
  }

  /** 0 ~ count-1 사이의 랜덤 정수 반환 */
  getRandomIndex(count: number): number {
    return Math.floor(Math.random() * count);
  }

  /** 스크린샷 저장 (path 미지정 시 Buffer 반환) */
  async screenshot(path?: string): Promise<Buffer> {
    return await this.page.screenshot({ path, fullPage: true });
  }

  /** 현재 컨텍스트의 스토리지 상태를 파일로 저장 */
  async saveStorageState(path: string) {
    await this.page.context().storageState({ path });
  }
}
