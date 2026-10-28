import { BasePage } from '../../common/BasePage';
import { PcLocators } from './locators';

export class MyPage extends BasePage {

  /** 마이 버튼 클릭 */
  async clickMyButton() {
    await this.goToHome();
    await this.click(PcLocators.my.myButton);
  }

  /** 마이 > 나의 쇼핑 현황 > 주문 내역 탭 클릭 */
  async clickOrderHistoryTab() {
    await this.click(PcLocators.my.orderHistoryTab);
  }

  /** 주문/취소 내역 노출 여부 반환 */
  async isOrderListVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.orderList);
  }

  /** 마이 > 나의 쇼핑 현황 > 취소/교환/반품 탭 클릭 */
  async clickClaimHistoryTab() {
    await this.click(PcLocators.my.claimHistoryTab);
  }

  /** 마이 > 나의 쇼핑 현황 > 기프티쇼 선물함 탭 클릭 */
  async clickGiftShowTab() {
    await this.click(PcLocators.my.giftShowTab);
  }

  /** 기프티쇼 선물함 노출 여부 반환 */
  async isGiftShowContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.giftShowContent);
  }

  /** 마이 > 나의 쇼핑 현황 > 잔액형 상품권 내역 조회 탭 클릭 */
  async clickGiftShowBalanceTab() {
    await this.click(PcLocators.my.giftShowBalanceTab);
  }

  /** 잔액형 상품권 내역 노출 여부 반환 */
  async isGiftShowBalanceContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.giftShowBalanceContent);
  }

  /** 마이 > 나의 쇼핑 현황 > 거래 증빙 서류 신청/조회 탭 클릭 */
  async clickTaxListTab() {
    await this.click(PcLocators.my.taxListTab);
  }

  /** 거래 증빙 서류 신청/조회 내역 노출 여부 반환 */
  async isTaxListContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.taxListContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 배송지 관리 탭 클릭 */
  async clickDeliveryAddressTab() {
    await this.click(PcLocators.my.deliveryAddressTab);
  }

  /** 배송지 관리 노출 여부 반환 */
  async isDeliveryAddressContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.deliveryAddressContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 연락처 관리 탭 클릭 */
  async clickPhoneAddressTab() {
    await this.click(PcLocators.my.phoneAddressTab);
  }

  /** 연락처 관리 노출 여부 반환 */
  async isPhoneAddressContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.phoneAddressContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 환불 계좌 관리 탭 클릭 */
  async clickRefundAccountTab() {
    await this.click(PcLocators.my.refundAccountTab);
  }

  /** 환불 계좌 관리 노출 여부 반환 */
  async isRefundAccountContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.refundAccountContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 선물 메시지 관리 탭 클릭 */
  async clickGiftMessageTab() {
    await this.click(PcLocators.my.giftMessageTab);
  }

  /** 선물 메시지 관리 노출 여부 반환 */
  async isGiftMessageContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.giftMessageContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 알파포인트 탭 클릭 */
  async clickAlphaPointTab() {
    await this.click(PcLocators.my.alphaPointTab);
  }

  /** 알파포인트 노출 여부 반환 */
  async isAlphaPointContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.alphaPointContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 이용권등록 탭 클릭 */
  async clickTicketTab() {
    await this.click(PcLocators.my.ticketTab);
  }

  /** 이용권등록 노출 여부 반환 */
  async isTicketContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.ticketContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 방송 알림 설정 탭 클릭 */
  async clickBroadcastNotificationTab() {
    await this.click(PcLocators.my.broadcastNotificationTab);
  }

  /** 방송 알림 설정 노출 여부 반환 */
  async isBroadcastNotificationContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.broadcastNotificationContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 간편 로그인 연결 탭 클릭 */
  async clickSimpleLoginTab() {
    await this.click(PcLocators.my.simpleLoginTab);
  }

  /** 간편 로그인 연결 노출 여부 반환 */
  async isSimpleLoginContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.simpleLoginContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 탭 클릭 */
  async clickModifyCustomerInfoTab() {
    await this.click(PcLocators.my.modifyCustomerInfoTab);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 이름 입력 */
  async fillName(name: string) {
    await this.pressSequentially(PcLocators.my.nameInput, name)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 동의하고 다음 버튼 클릭 */
  async clickNextButton() {
    await this.click(PcLocators.my.nextButton)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 성별 (남) 클릭 */
  async clickMaleButton() {
    await this.click(PcLocators.my.maleButton)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 생년월일 (연도) 입력 */
  async fillYear(year: string) {
    await this.pressSequentially(PcLocators.my.yearInput, year)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 생년월일 (월) 입력 */
  async fillMonth(month: string) {
    await this.pressSequentially(PcLocators.my.monthInput, month)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 생년월일 (일) 입력 */
  async fillDay(day: string) {
    await this.pressSequentially(PcLocators.my.dayInput, day)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 통신사 (KT) 클릭 */
  async clickKtAgencyButton() {
    await this.click(PcLocators.my.ktAgencyButton)
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 정보 수정 > 본인인증 > 휴대폰 번호 입력 */
  async fillPhoneNumber(phoneNumber: string) {
    await this.pressSequentially(PcLocators.my.phoneNumberInput, phoneNumber)
  }

  /** 회원 정보 수정 노출 여부 반환 */
  async isModifyCustomerInfoContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.modifyCustomerInfoContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 혜택 관리 탭 클릭 */
  async clickBenefitTab() {
    await this.click(PcLocators.my.benefitTab);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 회원 탈퇴 탭 클릭 */
  async clickWithdrawalTab() {
    await this.click(PcLocators.my.withdrawalTab);
  }

  /** 회원 탈퇴 본인인증 진입 화면이 완전히 노출됐는지 확인 */
  async isWithdrawalAuthVisible(): Promise<boolean> {
    await this.waitForURLContains('/custord/customer/auth/withdrawal');
    return await this.isVisible(PcLocators.my.withdrawalTitle)
      && await this.isVisible(PcLocators.my.withdrawalPhoneTitle);
  }

  /** 본인인증 후 회원 탈퇴 안내 화면 전체 노출을 기다려 확인 */
  async isWithdrawalContentVisible(timeout = 300): Promise<boolean> {
    await this.waitForElement(PcLocators.my.withdrawalGuideTitle, timeout);
    return await this.isVisible(PcLocators.my.withdrawalReasonButton)
      && await this.isVisible(PcLocators.my.withdrawalConsent)
      && await this.isVisible(PcLocators.my.withdrawalSubmitButton);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 장바구니 탭 클릭 */
  async clickCartTab() {
    await this.click(PcLocators.my.cartTab);
  }

  /** 장바구니 노출 여부 반환 */
  async isCartContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.cartContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 좋아요 탭 클릭 */
  async clickLikeTab() {
    await this.click(PcLocators.my.likeTab);
  }

  /** 좋아요 노출 여부 반환 */
  async isLikeContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.likeContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 상품평 탭 클릭 */
  async clickReviewTab() {
    await this.click(PcLocators.my.reviewTab);
  }

  /** 상품평 노출 여부 반환 */
  async isReviewContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.reviewContent);
  }

  /** 마이 > 나의 쇼핑 정보 관리 > 최근 본 상품 탭 클릭 */
  async clickRecentlyTab() {
    await this.click(PcLocators.my.recentlyTab);
  }

  /** 최근 본 상품 노출 여부 반환 */
  async isRecentlyContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.recentlyContent);
  }

  /** 마이 > 고객 센터 > 1:1 문의하기 탭 클릭 */
  async clickInquiryTab() {
    await this.click(PcLocators.my.inquiryTab);
  }

  /** 1:1 문의하기 노출 여부 반환 */
  async isInquiryContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.inquiryContent);
  }

  /** 마이 > 고객 센터 > 문의 내역 탭 클릭 */
  async clickInquiryListTab() {
    await this.click(PcLocators.my.inquiryListTab);
  }

  /** 문의 내역 노출 여부 반환 */
  async isInquiryListContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.inquiryListContent);
  }

  /** 마이 > 고객 센터 > 공지 사항 탭 클릭 */
  async clickNoticeTab() {
    await this.click(PcLocators.my.noticeTab);
  }

  /** 공지 사항 노출 여부 반환 */
  async isNoticeContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.noticeContent);
  }

  /** 마이 > 고객 센터 > 자주하는 질문 탭 클릭 */
  async clickFaqTab() {
    await this.click(PcLocators.my.faqTab);
  }

  /** 자주하는 질문 노출 여부 반환 */
  async isFaqContentVisible(): Promise<boolean> {
    return await this.isVisible(PcLocators.my.faqContent);
  }
}
