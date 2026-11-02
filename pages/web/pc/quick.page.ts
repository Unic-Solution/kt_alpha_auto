import { expect } from '@playwright/test';
import { CommonLocators } from '../../common/common.locators';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class QuickPage extends BasePage {

  async goToHome() {
    const url = new URL(CommonLocators.urls.homePage);
    url.searchParams.set('currentChannel', 'alpha');
    await this.goToUrl(url.href);
    await this.closeModal();
  }

  private async clickFixedMenu(role: 'button' | 'link', name: string | RegExp) {
    const item = this.page.locator(PcLocators.quick.fixedMenu).getByRole(role, { name, exact: typeof name === 'string' });
    await expect(item).toHaveCount(1);
    await expect(item).toBeVisible();
    await expect(item).toBeInViewport();
    await item.click();
  }

  /** 연속 검증 시작 전 최초 한 번만 편성표 화면을 준비한다. */
  async prepareFixedNavigation() {
    await this.goToUrl(new URL('/?currentChannel=alpha&gnbMenuId=G000000002', CommonLocators.urls.homePage).href);
    await this.closeModal();
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000002');
  }

  async verifyFixedHome(): Promise<boolean> {
    await this.clickFixedMenu('link', '홈');
    await expect(this.page).toHaveURL(url => url.pathname === '/' && url.searchParams.get('gnbMenuId') === 'G000000004');
    await this.closeModal();
    await expect(this.page.locator(PcLocators.main.onAirDisplay)).toBeVisible();
    return true;
  }

  async verifyFixedCategory(): Promise<boolean> {
    await this.clickFixedMenu('button', '카테고리');
    const modal = this.page.locator(PcLocators.quick.categoryModal);
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: '카테고리', level: 3, exact: true })).toBeVisible();
    await expect(modal.locator(PcLocators.quick.categoryLinks).first()).toBeVisible();
    await expect(modal.locator(PcLocators.quick.categoryLinks).first()).toHaveAttribute('href', /\/display\/display\/displayCategoryTemplate\?ctgrCdId=\d+/);
    await modal.getByRole('button', { name: '닫기', exact: true }).click();
    await expect(modal).toBeHidden();
    return true;
  }

  async verifyFixedMy(): Promise<boolean> {
    await this.clickFixedMenu('link', '마이');
    await expect(this.page).toHaveURL(url => url.pathname === PcLocators.urls.myPage);
    await expect(this.page.locator(PcLocators.login.logoutButton)).toBeVisible();
    return true;
  }

  async verifyFixedGiftShow(): Promise<boolean> {
    await this.clickFixedMenu('button', /기프티쇼/);
    await expect(this.page).toHaveURL(url => url.pathname === '/' && url.searchParams.get('gnbMenuId') === 'G000000007');
    await this.closeModal();
    const home = this.page.locator(PcLocators.quick.fixedMenu).getByRole('link', { name: '홈', exact: true });
    await expect(home).toHaveAttribute('href', /currentChannel=giftishow(?:&|$)/);
    await expect(this.page.locator(PcLocators.main.gnbSlides + '.swiper-slide-active')).toContainText(/\S/);
    return true;
  }

  async verifyFixedAlphaShopping(): Promise<boolean> {
    // 직전 단계에서 도달한 기프티쇼 화면에서 바로 쇼핑 채널로 복귀한다.
    await expect(this.page).toHaveURL(url => url.searchParams.get('gnbMenuId') === 'G000000007');
    await this.clickFixedMenu('button', /알파\s*쇼핑/);
    await expect(this.page).toHaveURL(url => url.pathname === '/' && url.searchParams.get('gnbMenuId') === 'G000000004');
    await this.closeModal();
    await expect(this.page.locator(PcLocators.quick.fixedMenu).getByRole('link', { name: '홈', exact: true }))
      .toHaveAttribute('href', /currentChannel=alpha(?:&|$)/);
    await expect(this.page.locator(PcLocators.main.onAirDisplay)).toBeVisible();
    return true;
  }

  async verifyFixedTop(): Promise<boolean> {
    await this.page.evaluate(() => window.scrollTo(0, 2000));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await this.page.waitForTimeout(400);
    // 모바일 TOP은 아래로 내린 뒤 위로 조금 올렸을 때 표시된다.
    await this.page.evaluate(() => window.scrollBy(0, -400));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    const before = this.page.url();
    const top = this.page.locator(PcLocators.quick.topButton);
    await expect(top).toBeVisible();
    await expect(top).toBeInViewport();
    await top.click();
    await expect.poll(() => this.page.evaluate(() => window.scrollY), { message: 'TOP 클릭 후 실제 최상단 이동' }).toBe(0);
    await expect(this.page).toHaveURL(before);
    return true;
  }


  /** ON AIR 버튼 클릭 */
  async clickOnAirButton() {
    await this.click(PcLocators.main.onAirButton);
  }

  /** ON AIR 모달 img 노출 여부 반환 */
  async isOnAirModalImgVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.quick.onAirModalImg);
  }

  /** ON AIR > 바로구매 버튼 Text 추출 */
  async getDirectBuyButtonText(): Promise<string> {
    return await this.getText(PcLocators.quick.onAirDirectBuyButton);
  }

  /** ON AIR > 바로구매 버튼 클릭 */
  async clickDirectBuyButton() {
    await this.click(PcLocators.quick.onAirDirectBuyButton);
  }

  /** ON AIR > 바로구매 > 옵션 선택 (중첩 옵션박스 대응) */
  async selectFirstEnabledOption() {
    let prevCount = 0;

    while (true) {
      const count = await this.count(PcLocators.product.optionBox);
      if (count === 0 || count === prevCount) return;
      prevCount = count;
      await this.clickFirstEnabled(PcLocators.main.onAirDirectBuySecondOption);
    }
  }

  /** ON AIR > 바로구매 > 옵션 선택까지 수행 */
  async selectOnAirOption(): Promise<boolean> {
    await this.goToHome();
    await this.clickOnAirButton();
    const text = await this.getDirectBuyButtonText();
    await this.clickDirectBuyButton();
    if (text === "상담 신청") return false;
    await this.selectFirstEnabledOption();
    return true;
  }

  /** ON AIR > 선물하기 버튼 클릭 */
  async clickOnAirGiftButton() {
    await this.click(PcLocators.main.onAirGiftButton);
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirGiftOrder);
  }

  /** ON AIR 상품 이름 추출 */
  async getOnAirProductName(): Promise<string> {
    return (await this.getText(PcLocators.quick.onAirProductName)).replace(/\s/g, '');
  }

  /** ON AIR > 장바구니 버튼 클릭 (버튼 없으면 false 반환) */
  async clickOnAirCartButton(): Promise<boolean> {
    const exists = await this.isVisible(PcLocators.main.onAirCartButton);

    if (!exists) return false;

    await this.click(PcLocators.main.onAirCartButton);
    return true;
  }

  /** ON AIR > 장바구니 > 바로가기 버튼 클릭 */
  async clickOnAirCartMoveButton() {
    await this.click(PcLocators.main.onAirCartMoveButton);
  }

  /** 장바구니 상품 이름 추출 */
  async getCartProductName(): Promise<string> {
    return (await this.getText(PcLocators.main.cartProductName)).replace(/\s/g, '');
  }

  /** 장바구니 선택 삭제 버튼 클릭 (dialog 자동 수락) */
  async clickCartDeleteButton() {
    this.page.once('dialog', dialog => dialog.accept());
    await this.click(PcLocators.main.cartDeleteButton);
  }

  /** ON AIR > 구매하기 버튼 클릭 */
  async clickOnAirBuyButton() {
    await this.click(PcLocators.main.onAirBuyButton);
  }

  /** 구매하기 주문서 페이지 URL 확인 */
  async isBuyOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirBuyOrder);
  }
}
