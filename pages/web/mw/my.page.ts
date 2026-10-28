import { BasePage } from '../../common/BasePage';
import { MwLocators } from './locators';
import { CommonLocators } from '../../common/common.locators';

export class MyPage extends BasePage {

  async goToHome() {
    await this.goToUrl(CommonLocators.urls.mwHomePage);
    await this.closeModal();
  }

  async clickMyButton() {
    await this.goToHome();
    await this.click(MwLocators.my.myButton);
  }

  async clickOrderHistoryTab() {
    await this.click(MwLocators.my.orderHistoryTab);
  }

  async isOrderListVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.orderList);
  }

  async clickClaimHistoryTab() {
    await this.click(MwLocators.my.claimHistoryTab);
  }

  async clickGiftShowTab() {
    await this.click(MwLocators.my.giftShowTab);
  }

  async isGiftShowContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.giftShowContent);
  }

  async clickGiftShowBalanceTab() {
    await this.click(MwLocators.my.giftShowBalanceTab);
  }

  async isGiftShowBalanceContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.giftShowBalanceContent);
  }

  async clickTaxListTab() {
    await this.click(MwLocators.my.taxListTab);
  }

  async isTaxListContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.taxListContent);
  }

  async clickDeliveryAddressTab() {
    await this.click(MwLocators.my.deliveryAddressTab);
  }

  async isDeliveryAddressContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.deliveryAddressContent);
  }

  async clickPhoneAddressTab() {
    await this.click(MwLocators.my.phoneAddressTab);
  }

  async isPhoneAddressContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.phoneAddressContent);
  }

  async clickRefundAccountTab() {
    await this.click(MwLocators.my.refundAccountTab);
  }

  async isRefundAccountContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.refundAccountContent);
  }

  async clickGiftMessageTab() {
    await this.click(MwLocators.my.giftMessageTab);
  }

  async isGiftMessageContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.giftMessageContent);
  }

  async clickAlphaPointTab() {
    await this.click(MwLocators.my.alphaPointTab);
  }

  async isAlphaPointContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.alphaPointContent);
  }

  async clickTicketTab() {
    await this.click(MwLocators.my.ticketTab);
  }

  async isTicketContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.ticketContent);
  }

  async clickBroadcastNotificationTab() {
    await this.click(MwLocators.my.broadcastNotificationTab);
  }

  async isBroadcastNotificationContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.broadcastNotificationContent);
  }

  async clickSimpleLoginTab() {
    await this.click(MwLocators.my.simpleLoginTab);
  }

  async isSimpleLoginContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.simpleLoginContent);
  }

  async clickModifyCustomerInfoTab() {
    await this.click(MwLocators.my.modifyCustomerInfoTab);
  }

  async fillName(name: string) {
    await this.pressSequentially(MwLocators.my.nameInput, name);
  }

  async clickNextButton() {
    await this.click(MwLocators.my.nextButton);
  }

  async clickMaleButton() {
    await this.click(MwLocators.my.maleButton);
  }

  async fillYear(year: string) {
    await this.pressSequentially(MwLocators.my.yearInput, year);
  }

  async fillMonth(month: string) {
    await this.pressSequentially(MwLocators.my.monthInput, month);
  }

  async fillDay(day: string) {
    await this.pressSequentially(MwLocators.my.dayInput, day);
  }

  async clickKtAgencyButton() {
    await this.click(MwLocators.my.ktAgencyButton);
  }

  async fillPhoneNumber(phoneNumber: string) {
    await this.pressSequentially(MwLocators.my.phoneNumberInput, phoneNumber);
  }

  async isModifyCustomerInfoContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.modifyCustomerInfoContent);
  }

  async clickBenefitTab() {
    await this.click(MwLocators.my.benefitTab);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 탈퇴 탭 클릭 */
  async clickWithdrawalTab() {
    await this.click(MwLocators.my.withdrawalTab);
  }

  /** 회원 탈퇴 본인인증 진입 화면이 완전히 노출됐는지 확인 */
  async isWithdrawalAuthVisible(): Promise<boolean> {
    await this.waitForURLContains('/custord/customer/auth/withdrawal');
    return await this.isVisible(MwLocators.my.withdrawalTitle)
      && await this.isVisible(MwLocators.my.withdrawalPhoneTitle);
  }

  /** 본인인증 후 회원 탈퇴 안내 화면 전체 노출을 기다려 확인 */
  async isWithdrawalContentVisible(timeout = 300): Promise<boolean> {
    await this.waitForElement(MwLocators.my.withdrawalGuideTitle, timeout);
    return await this.isVisible(MwLocators.my.withdrawalReasonButton)
      && await this.isVisible(MwLocators.my.withdrawalConsent)
      && await this.isVisible(MwLocators.my.withdrawalSubmitButton);
  }

  async clickCartTab() {
    await this.click(MwLocators.my.cartTab);
  }

  async isCartContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.cartContent);
  }

  async clickLikeTab() {
    await this.click(MwLocators.my.likeTab);
  }

  async isLikeContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.likeContent);
  }

  async clickReviewTab() {
    await this.click(MwLocators.my.reviewTab);
  }

  async isReviewContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.reviewContent);
  }

  async clickRecentlyTab() {
    await this.click(MwLocators.my.recentlyTab);
  }

  async isRecentlyContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.recentlyContent);
  }

  async clickInquiryTab() {
    await this.click(MwLocators.my.inquiryTab);
  }

  async isInquiryContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.inquiryContent);
  }

  async clickInquiryListTab() {
    await this.click(MwLocators.my.inquiryListTab);
  }

  async isInquiryListContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.inquiryListContent);
  }

  async clickNoticeTab() {
    await this.click(MwLocators.my.noticeTab);
  }

  async isNoticeContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.noticeContent);
  }

  async clickFaqTab() {
    await this.click(MwLocators.my.faqTab);
  }

  async isFaqContentVisible(): Promise<boolean> {
    return await this.isVisible(MwLocators.my.faqContent);
  }
}
