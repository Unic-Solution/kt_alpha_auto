import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';
import { MainPage } from './main.page';

export class ProductPage extends BasePage {

  /** 홈의 지금 방송중 상품 상세로 이동하고 상품명을 반환한다. */
  async openCurrentOnAirProduct(): Promise<string> {
    await this.goToHome();
    const section = this.page.locator(PcLocators.main.onAirDisplay);
    const title = section.locator(PcLocators.main.onAirTitle);
    await section.scrollIntoViewIfNeeded();
    await expect(title, '현재 방송 상품 링크가 노출되어야 한다').toBeVisible();
    const productName = (await title.innerText()).trim();
    const href = await title.getAttribute('href');
    expect(href, '현재 방송 상품 상세 경로').toMatch(/^\/display\/product\/\d+/);
    await title.click();
    await expect(this.page).toHaveURL(url => url.pathname === new URL(href!, this.page.url()).pathname);
    await this.closeModal();
    await expect(this.page.locator(PcLocators.product.productName), '현재 방송 상품 상세가 로딩되어야 한다')
      .toContainText(productName, { timeout: 15_000 });
    return productName;
  }

  /** 통합 테스트에서 처음 선택한 상품 상세로 다시 돌아온다. */
  async reopenProductDetail(url: string, productName: string) {
    const current = new URL(this.page.url());
    const target = new URL(url);
    if (current.pathname !== target.pathname || current.search !== target.search) await this.goToUrl(url);
    await this.closeModal();
    await expect(this.page.locator(PcLocators.product.productName), '14번에서 선택한 상품 상세가 로딩되어야 한다')
      .toContainText(productName, { timeout: 15_000 });
  }

  /** ON AIR 버튼 클릭 */
  async clickOnAirButton() {
    const button = this.page.locator(PcLocators.main.onAirButton).filter({ visible: true });
    if (await button.count()) await button.first().click();
    else await this.page.locator(PcLocators.main.onAirDisplay).scrollIntoViewIfNeeded();
  }

  /** ON AIR > 비디오 재생 */
  async playVideo() {
    const video = this.page.locator(`main video, ${PcLocators.product.onAirVideo}`).filter({ visible: true }).first();
    if (await video.count() && await video.evaluate(element => (element as HTMLVideoElement).paused)) {
      await video.evaluate(element => (element as HTMLVideoElement).play());
    }
    await this.wait(2);
  }

  /** 비디오 재생 여부 반환 (autoplay 속성 존재 여부) */
  async isVideoPlaying(): Promise<boolean> {
    const video = this.page.locator(`main video, ${PcLocators.product.onAirVideo}`).filter({ visible: true }).first();
    await video.waitFor({ state: 'visible' });
    return await video.evaluate(element => {
      const media = element as HTMLVideoElement;
      return !media.paused || media.autoplay;
    });
  }

  /** 편성표 탭 클릭 */
  async clickBroadcastSchedule() {
    const schedule = this.page.locator(PcLocators.main.onAirDisplay).locator(PcLocators.main.onAirSchedule);
    await schedule.scrollIntoViewIfNeeded();
    await schedule.click();
  }

  /** 방송알림 대상 상품명을 저장하고 알림 버튼 클릭 */
  async clickAlarmButton(expectedProductName?: string): Promise<string> {
    const buttons = this.page.locator(PcLocators.product.alarmButton);
    let button = buttons.last();
    if (expectedProductName) {
      const live = this.page.locator(PcLocators.main.liveBroadcast);
      const matchingProduct = live.locator(PcLocators.main.liveProduct).filter({
        has: this.page.getByRole('link', { name: expectedProductName, exact: true }),
      });
      await expect(matchingProduct, '현재 방송 상품이 편성표에 있어야 한다').toHaveCount(1);
      button = matchingProduct.locator(PcLocators.product.alarmButton);
    }
    const item = button.locator('xpath=ancestor::*[.//a[contains(@class,"OnAirProgram_title")]][1]');
    const productName = (await item.locator(PcLocators.main.liveProductTitle).innerText()).trim();
    await button.click();
    return productName;
  }

  /** 신규 방송알림 등록 팝업 노출 여부 */
  async isBroadcastNotificationModalVisible(): Promise<boolean> {
    const heading = this.page.getByRole('heading', { name: '방송 알림 등록', exact: true });
    await heading.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => {});
    return heading.isVisible();
  }

  /** 광고성 SMS 수신 동의 스위치가 있으면 활성화 */
  async clickSmsConsentCheckbox() {
    const name = '(필수) 광고성 SMS 수신 동의';
    await expect(this.page.locator(PcLocators.product.broadcastNotificationRegisterButton)).toBeVisible();
    const checkbox = this.page.getByRole('checkbox', { name, exact: true });
    if (!await checkbox.count()) return;
    await expect(checkbox).toBeVisible();
    if (!await checkbox.isChecked()) await checkbox.locator('xpath=..').click();
    await expect(checkbox).toBeChecked();
  }

  /** 상품 알림만 검증하도록 함께 알림등록을 해제 */
  async disableTogetherNotification() {
    const checkbox = this.page.getByRole('checkbox', { name: '함께 알림등록', exact: true });
    if (!await checkbox.count() || !await checkbox.isChecked()) return;
    await checkbox.locator('xpath=..').click();
    await expect(checkbox).not.toBeChecked();
  }

  /** 방송 알림 등록하기 버튼 클릭 */
  async clickBroadcastNotificationRegisterButton() {
    await this.click(PcLocators.product.broadcastNotificationRegisterButton);
  }

  /** 방송알림 등록 결과 안내가 있으면 확인 */
  async confirmBroadcastNotificationIfVisible() {
    const confirm = this.page.getByText('확인', { exact: true }).filter({ visible: true }).last();
    await confirm.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
    if (await confirm.isVisible()) await confirm.click();
  }

  /** 방송 알림 등록 후 내 방송알림보기 버튼 클릭 */
  async clickMyBroadcastNotificationButton() {
    const button = this.page.locator(PcLocators.product.myBroadcastNotificationButton);
    if (await button.isVisible()) {
      await button.click();
      return;
    }
    await this.goToUrl(new URL(PcLocators.urls.myPage, this.page.url()).href);
    const link = this.page.getByRole('link', { name: '방송 알림 설정', exact: true });
    const heading = this.page.getByRole('heading', { name: '방송알림', exact: true, level: 1 });
    await expect(async () => {
      if (!await heading.isVisible()) await link.click();
      await expect(heading).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000, intervals: [1_000] });
  }

  /** 마이페이지 방송알림 목록에서 등록 상품명 확인 */
  async getRegisteredBroadcastNotification(productName: string): Promise<string | null> {
    const normalize = (name: string) => name.replace(/^(?:\[[^\]]+\]\s*)+/, '').trim();
    const expected = normalize(productName);
    const names = await this.page.locator('main strong').allTextContents();
    return names.find(name => normalize(name) === expected) ?? null;
  }

  /** MD's Pick 상품 영역으로 스크롤 */
  async scrollToProduct() {
    await this.scrollIntoView(PcLocators.product.mdsPickSection);
  }

  /** 홈으로 이동 후 임의 상품 클릭 */
  async clickProduct() {
    await this.goToHome();
    await this.scrollToProduct();
    await this.click(PcLocators.product.mdsPickProduct, true);
  }

  /** 상품 > 좋아요(하트) 버튼 클릭 */
  async clickProductLikeButton() {
    await this.click(PcLocators.product.productLikeButton);
  }

  /** 마이페이지 > 좋아요 탭으로 이동 */
  async gotoLikePage() {
    await this.goToUrl(PcLocators.urls.myLikePage);
  }

  /** 마이페이지 > 좋아요 탭 > 좋아요 버튼 노출 여부 반환 */
  async isLikeButtonVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.likePageLikeButton);
  }

  /** 마이페이지 > 좋아요 탭 > 좋아요(하트) 버튼 클릭 */
  async clickLikePageLikeButton() {
    await this.click(PcLocators.product.likePageLikeButton);
    await this.waitForHidden(PcLocators.product.likePageLikeButton, 5).catch(() => {});
  }

  /** 상품 > 상세정보 탭 클릭 */
  async clickProductDetailInfoTab() {
    await this.click(PcLocators.product.productDetailInfoTab);
  }

  /** 상품 > 상세정보 노출 여부 반환 */
  async isProductDetailInfoVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productDetailInfo);
  }

  /** 상품 > 구매정보 탭 클릭 */
  async clickProductBuyInfoTab() {
    await this.click(PcLocators.product.productBuyInfoTab);
  }

  /** 상품 > 구매정보 노출 여부 반환 */
  async isProductBuyInfoVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productBuyInfo);
  }

  /** 상품 > 상품평 탭 클릭 */
  async clickProductReviewTab() {
    await this.click(PcLocators.product.productReviewTab);
  }

  /** 상품 > 상품평 노출 여부 반환 */
  async isProductReviewVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productReview);
  }

  /** 상품 > 상품문의 탭 클릭 */
  async clickProductQnaTab() {
    await this.click(PcLocators.product.productQnaTab);
  }

  /** 상품 > 상품문의 노출 여부 반환 */
  async isProductQnaVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.product.productQna);
  }

  /** 옵션 선택 (중첩 옵션박스 대응) */
  async selectFirstEnabledOption() {
    let prevCount = 0;

    while (true) {
      const count = await this.count(PcLocators.product.optionBox);
      if (count === 0 || count === prevCount) return;
      prevCount = count;
      await this.clickFirstEnabled(PcLocators.main.onAirDirectBuyFirstOption);
    }
  }

  /** 상품 > 선물하기 버튼 클릭 (옵션 선택 포함) */
  async clickProductGift() {
    await this.click(PcLocators.main.onAirGiftButton);
    await this.selectFirstEnabledOption();
    await this.lastClick(PcLocators.main.onAirGiftButton);
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(PcLocators.urls.onAirGiftOrder);
  }

  /** 상품 이름 추출 */
  async getProductName(): Promise<string> {
    return (await this.getText(PcLocators.product.productName)).replace(/\s/g, '');
  }

  /** 상품 > 장바구니 버튼 클릭 (버튼 없으면 false 반환, 옵션 선택 포함) */
  async clickProductCart(): Promise<boolean> {
    const exists = await this.isVisible(PcLocators.main.onAirCartButton);

    if (!exists) return false;

    await this.click(PcLocators.main.onAirCartButton);
    await this.selectFirstEnabledOption();
    await this.lastClick(PcLocators.main.onAirCartButton);
    return true;
  }

  /** 상품 > 장바구니 > 바로가기 버튼 클릭 */
  async clickProductCartMoveButton() {
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

  /** 상품 > 구매하기 버튼 클릭 (옵션 선택 포함) */
  async clickProductBuy() {
    const modal = this.page.locator(PcLocators.main.purchaseModal);
    const button = this.page.locator('main [class*="ButtonPurchase_wrap"]').getByRole('button', { name: /구매하기$/ }).first();
    await expect(async () => {
      if (!await modal.isVisible()) await button.click();
      await expect(modal, '구매 옵션 모달이 열려야 한다').toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000, intervals: [1_000] });
    await this.selectFirstEnabledOption();
    const confirm = modal.getByRole('button', { name: /구매하기$/ }).last();
    await expect(confirm).toBeVisible();
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await this.page.waitForURL(url => url.pathname === '/' + PcLocators.urls.onAirBuyOrder, { timeout: 20_000, waitUntil: 'domcontentloaded' });
  }

  /** 구매하기 주문서 페이지 URL 확인 */
  async isBuyOrderPage(): Promise<boolean> {
    const loaded = await new MainPage(this.page).isBuyOrderPage();
    await this.wait(2);
    return loaded;
  }
}
