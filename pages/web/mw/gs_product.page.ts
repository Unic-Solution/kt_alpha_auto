import { BasePage } from '../../common/BasePage';
import { MwLocators } from './locators';

export class GsProductPage extends BasePage {

  async clickProduct() {
    await this.clickGiftShowButton();
    await this.click(MwLocators.giftShowProduct.giftProduct);
  }

  async clickProductLikeButton() {
    await this.click(MwLocators.product.productLikeButton);
  }

  async gotoLikePage() {
    await this.goToUrl(MwLocators.urls.myLikePage);
  }

  async isLikeButtonVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.product.likePageLikeButton);
  }

  async clickLikePageLikeButton() {
    await this.click(MwLocators.product.likePageLikeButton);
    await this.waitForHidden(MwLocators.product.likePageLikeButton, 5).catch(() => {});
  }

  async clickProductDetailInfoTab() {
    await this.click(MwLocators.product.productDetailInfoTab);
  }

  async isProductDetailInfoVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.product.productDetailInfo);
  }

  async clickProductBuyInfoTab() {
    await this.click(MwLocators.product.productBuyInfoTab);
  }

  async isProductBuyInfoVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.product.productBuyInfo);
  }

  async clickProductGift() {
    await this.click(MwLocators.giftShowProduct.giftButton);
  }

  async isGiftOrderPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.giftShowGiftOrder);
  }

  async clickGiftShowMainPhoneNumberButton() {
    await this.click(MwLocators.giftShowProduct.giftShowMainPhoneNumberButton);
  }

  async isSenderInputEmpty(): Promise<boolean> {
    return await this.isEmpty(MwLocators.giftShowProduct.senderInput);
  }

  async fillAndVerify(name: string): Promise<boolean> {
    await this.pressSequentially(MwLocators.giftShowProduct.senderInput, name);
    const value = await this.getValue(MwLocators.giftShowProduct.senderInput);
    return value === name;
  }

  async clickMyPhoneNumberButton() {
    await this.click(MwLocators.giftShowProduct.myPhoneNumberButton);
  }

  async getSenderInputValue(): Promise<string> {
    return await this.getValue(MwLocators.giftShowProduct.senderInput);
  }

  async extractTotalRecipients(): Promise<number | false> {
    const text = await this.getText(MwLocators.giftShowProduct.totalRecipients);
    return this.extractNumber(text);
  }

  async clickPaymentButton() {
    await this.click(MwLocators.giftShowProduct.paymentButton);
  }

  async fillRecipientPhoneNumber(phoneNumber: string) {
    await this.pressSequentially(MwLocators.giftShowProduct.recipientPhoneNumberInput, phoneNumber);
  }

  async fillRecipientName(name: string) {
    await this.pressSequentially(MwLocators.giftShowProduct.recipientNameInput, name);
  }

  async clickSendToMeButton() {
    await this.click(MwLocators.giftShowProduct.sendToMeButton);
  }

  async reClickSendToMeButton() {
    await this.lastClick(MwLocators.giftShowProduct.sendToMeButton);
  }

  async isPaymentPage(): Promise<boolean> {
    return this.urlContains(MwLocators.urls.giftShowPaymentOrder);
  }

  /** 모바일 이미지 변경 모달에서 선택 후 주문서 미리보기 적용 확인 */
  private async selectAndApplyGiftImage(changeIndex: number, previewIndex: number): Promise<boolean> {
    const preview = this.page.locator(MwLocators.giftShowProduct.giftPreviewImages).nth(previewIndex);
    await this.page.locator(MwLocators.giftShowProduct.giftChangeButtons).nth(changeIndex).click();
    const modal = this.page.locator(MwLocators.giftShowProduct.giftDecorationModal);
    await modal.waitFor({ state: 'visible' });
    const selected = this.page.locator(MwLocators.giftShowProduct.giftDecorationChoices).nth(1);
    const selectedSrc = await selected.locator('img').getAttribute('src');
    await selected.click();
    await this.page.locator(MwLocators.giftShowProduct.giftDecorationApplyButton).click();
    await modal.waitFor({ state: 'hidden' });
    await preview.evaluate(image => (image as HTMLImageElement).decode());
    const appliedSrc = await preview.getAttribute('src');
    return selectedSrc?.split('/dims/')[0] === appliedSrc?.split('/dims/')[0];
  }

  /** 선물 꾸미기 배너 이미지 선택·적용 확인 */
  async selectAndVerifyGiftBanner(): Promise<boolean> {
    return this.selectAndApplyGiftImage(0, 0);
  }

  /** 선물 꾸미기 카드 이미지 선택·적용 확인 */
  async selectAndVerifyGiftCard(): Promise<boolean> {
    return this.selectAndApplyGiftImage(1, 2);
  }

  /** 선물 메시지 직접 입력 후 입력값 확인 */
  async fillAndVerifyGiftMessage(message: string): Promise<boolean> {
    const input = this.visibleGiftMessageInput();
    await input.clear();
    await input.pressSequentially(message);
    return await input.inputValue() === message;
  }

  /** 추천 메시지 선택 후 입력란 반영 확인 */
  async selectAndVerifyRecommendedMessage(): Promise<boolean> {
    await this.page.locator(MwLocators.giftShowProduct.recommendMessageButton).filter({ visible: true }).click();
    const modal = this.page.locator(MwLocators.giftShowProduct.messageModal).filter({ visible: true });
    await modal.waitFor({ state: 'visible' });
    await this.page.locator(MwLocators.giftShowProduct.recommendMessageCategory).filter({ visible: true }).click();
    const item = this.page.locator(MwLocators.giftShowProduct.recommendMessageItems).filter({ visible: true }).first();
    await item.waitFor({ state: 'visible' });
    const message = (await item.innerText()).trim();
    if (!message) return false;
    await item.click();
    await this.page.locator(MwLocators.giftShowProduct.recommendMessageApplyButton).filter({ visible: true }).click();
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
    await this.page.locator(MwLocators.giftShowProduct.specialCharacterButton).filter({ visible: true }).click();
    const character = this.page.locator(MwLocators.giftShowProduct.specialCharacterOption).filter({ visible: true });
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
    return this.page.locator(MwLocators.giftShowProduct.giftMessageInput).filter({ visible: true }).first();
  }
}
