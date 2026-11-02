import { expect } from '@playwright/test';
import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class GsProductPage extends BasePage {

  /** 홈으로 이동 후 임의 상품 클릭 */
  async clickProduct() {
    await this.clickGiftShowButton();
    await this.click(PcLocators.giftShowProduct.giftProduct);
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

  /** 상품 > 선물하기 버튼 클릭 */
  async clickProductGift() {
    await this.click(PcLocators.giftShowProduct.giftButton);
  }

  /** 선물하기 주문서 페이지 URL 확인 */
  async isGiftOrderPage(): Promise<boolean> {
    await expect(this.page).toHaveURL(
      url => url.pathname === '/' + PcLocators.urls.giftShowGiftOrder,
      { timeout: 20_000 },
    );
    const main = this.page.locator('main');
    await expect(main, '기프티쇼 선물 주문서 본문이 노출되어야 한다').toBeVisible();
    await expect(main).not.toBeEmpty();
    await expect(this.page.locator(PcLocators.giftShowProduct.senderInput), '보내는 사람 입력 영역이 노출되어야 한다')
      .toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator(PcLocators.giftShowProduct.paymentButton), '결제 진행 버튼 영역이 노출되어야 한다')
      .toBeVisible();
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(2_000);
    return true;
  }

  /** 선물하기 > 기프티쇼 대표 번호 버튼 클릭 */
  async clickGiftShowMainPhoneNumberButton() {
    await this.click(PcLocators.giftShowProduct.giftShowMainPhoneNumberButton);
  }

  /** 선물하기 > 보내는 사람 input 비어있는지 확인 */
  async isSenderInputEmpty(): Promise<boolean> {
    return await this.isEmpty(PcLocators.giftShowProduct.senderInput);
  }

  /** 선물하기 > 보내는 사람 input 입력 및 정상 입력 여부 확인 */
  async fillAndVerify(name: string): Promise<boolean> {
    await this.pressSequentially(PcLocators.giftShowProduct.senderInput, name);
    const value = await this.getValue(PcLocators.giftShowProduct.senderInput);
    return value === name;
  }

  /** 선물하기 > 내 번호 버튼 클릭 */
  async clickMyPhoneNumberButton() {
    await this.click(PcLocators.giftShowProduct.myPhoneNumberButton);
  }

  /** 선물하기 > 보내는 사람 input값 추출 */
  async getSenderInputValue(): Promise<string> {
    return await this.getValue(PcLocators.giftShowProduct.senderInput);
  }

  /** 선물하기 > 받는 사람 수 추출 */
  async extractTotalRecipients(): Promise<number | false> {
    const text = await this.getText(PcLocators.giftShowProduct.totalRecipients);
    return this.extractNumber(text);
  }

  /** 상단 받는 사람 인원 수가 기대값으로 갱신되는지 확인 */
  async waitForTotalRecipients(expected: number) {
    const total = this.page.locator(PcLocators.giftShowProduct.totalRecipients);
    await expect(total).toHaveText(`총 ${expected}명`, { timeout: 10_000 });
    await total.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(2_000);
  }

  /** 선물하기 > 결제 진행 버튼 클릭 */
  async clickPaymentButton() {
    await this.click(PcLocators.giftShowProduct.paymentButton);
  }

  /** 선물하기 > 받는 사람 휴대폰 번호 입력 */
  async fillRecipientPhoneNumber(phoneNumber: string) {
    await this.pressSequentially(PcLocators.giftShowProduct.recipientPhoneNumberInput, phoneNumber)
  }

  /** 선물하기 > 받는 사람 이름 입력 */
  async fillRecipientName(name: string) {
    await this.pressSequentially(PcLocators.giftShowProduct.recipientNameInput, name)
  }

  /** 상품 > 나에게 보내기 버튼 클릭 */
  async clickSendToMeButton() {
    await this.click(PcLocators.giftShowProduct.sendToMeButton);
  }

  /** 상품 > 나에게 보내기 버튼 클릭 */
  async reClickSendToMeButton() {
    await this.lastClick(PcLocators.giftShowProduct.sendToMeButton);
  }

  /** 상품 결제 주문서 페이지 URL 확인 */
  async isPaymentPage(): Promise<boolean> {
    await expect(this.page).toHaveURL(
      url => url.pathname === '/' + PcLocators.urls.giftShowPaymentOrder,
      { timeout: 20_000 },
    );
    const main = this.page.locator('main');
    await expect(main, '기프티쇼 상품 결제 본문이 노출되어야 한다').toBeVisible();
    await expect(main).not.toBeEmpty();
    await expect(main.getByRole('button', { name: /결제하기$/ }), '결제하기 버튼이 노출되어야 한다')
      .toBeVisible({ timeout: 15_000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(2_000);
    return true;
  }

  /** 선물 꾸미기 이미지 선택 후 선택 이미지가 활성 상태로 적용됐는지 확인 */
  private async selectAndVerifyGiftImage(selector: string): Promise<boolean> {
    const items = this.page.locator(selector).filter({ visible: true });
    await items.nth(1).waitFor({ state: 'visible' });
    if (await items.count() < 2) return false;
    const selected = items.nth(1);
    const selectedSrc = await selected.locator('img').getAttribute('src');
    await selected.scrollIntoViewIfNeeded();
    await selected.click();
    const active = items.and(this.page.locator('[class*="GiftDecoration_active"]'));
    await active.locator('img').evaluate(image => (image as HTMLImageElement).decode());
    return await active.count() === 1
      && await active.locator('img').getAttribute('src') === selectedSrc
      && await active.locator('img').evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0);
  }

  /** 선물 꾸미기 배너 이미지 선택·적용 확인 */
  async selectAndVerifyGiftBanner(): Promise<boolean> {
    return this.selectAndVerifyGiftImage(PcLocators.giftShowProduct.giftBannerItems);
  }

  /** 선물 꾸미기 카드 이미지 선택·적용 확인 */
  async selectAndVerifyGiftCard(): Promise<boolean> {
    return this.selectAndVerifyGiftImage(PcLocators.giftShowProduct.giftCardItems);
  }

  /** 선물 메시지 직접 입력 후 입력값 확인 */
  async fillAndVerifyGiftMessage(message: string): Promise<boolean> {
    const input = this.page.locator(PcLocators.giftShowProduct.giftMessageInput).filter({ visible: true }).first();
    await input.clear();
    await input.pressSequentially(message);
    return await input.inputValue() === message;
  }

  /** 추천 메시지 선택 후 입력란 반영 확인 */
  async selectAndVerifyRecommendedMessage(): Promise<boolean> {
    await this.page.locator(PcLocators.giftShowProduct.recommendMessageButton).filter({ visible: true }).click();
    const modal = this.page.locator(PcLocators.giftShowProduct.messageModal).filter({ visible: true });
    await modal.waitFor({ state: 'visible' });
    await this.page.locator(PcLocators.giftShowProduct.recommendMessageCategory).filter({ visible: true }).click();
    const item = this.page.locator(PcLocators.giftShowProduct.recommendMessageItems).filter({ visible: true }).first();
    await item.waitFor({ state: 'visible' });
    const message = (await item.innerText()).trim();
    if (!message) return false;
    await item.click();
    await this.page.locator(PcLocators.giftShowProduct.recommendMessageApplyButton).filter({ visible: true }).click();
    await modal.waitFor({ state: 'hidden' });
    const input = this.visibleGiftMessageInput();
    const applied = (await input.inputValue()).trim() === message;
    if (applied) {
      await input.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1_500);
    }
    return applied;
  }

  /** 특수문자 선택 후 기존 메시지에 추가됐는지 확인 */
  async selectAndVerifySpecialCharacter(): Promise<boolean> {
    const input = this.visibleGiftMessageInput();
    const before = await input.inputValue();
    await this.page.locator(PcLocators.giftShowProduct.specialCharacterButton).filter({ visible: true }).click();
    const character = this.page.locator(PcLocators.giftShowProduct.specialCharacterOption).filter({ visible: true });
    await character.waitFor({ state: 'visible' });
    await character.click();
    const after = await input.inputValue();
    const applied = after === `${before}~`;
    if (applied) {
      await input.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1_500);
    }
    return applied;
  }

  private visibleGiftMessageInput() {
    return this.page.locator(PcLocators.giftShowProduct.giftMessageInput).filter({ visible: true }).first();
  }

}
