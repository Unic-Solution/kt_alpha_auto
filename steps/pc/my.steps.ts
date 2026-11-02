import { BasePage } from '../../pages/common/BasePage';
import { MyPage } from '../../pages/web/pc/my.page';
import { parameter } from '../../utils/step-runner';
import { notifyManualAuth } from '../../utils/manual-auth';

export class MySteps {
  private myPage: MyPage;

  constructor(basePage: BasePage) {
    this.myPage = new MyPage(basePage.getPage());
  }

  private async waitForManualAuthenticationIfNeeded() {
    if (!await this.myPage.isManualAuthenticationVisible()) return;
    await notifyManualAuth('PC', '본인인증');
    await this.myPage.waitForManualAuthentication();
  }

  /** 나의 쇼핑 현황 > 주문 내역 확인 */
  async verifyOrderHistory(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickOrderHistoryTab();
    return await this.myPage.isOrderListVisible();
  }

  /** 나의 쇼핑 현황 > 취소/교환/반품 내역 확인 */
  async verifyClaimHistory(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickClaimHistoryTab();
    return await this.myPage.isOrderListVisible();
  }

  /** 나의 쇼핑 현황 > 기프티쇼 선물함 확인 */
  async verifyGiftShow(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftShowTab();
    await this.waitForManualAuthenticationIfNeeded();
    const visible = await this.myPage.isGiftShowContentVisible();
    if (visible) await this.myPage.wait(2);
    return visible;
  }

  /** 나의 쇼핑 현황 > 잔액형 상품권 내역 확인 */
  async verifyGiftShowBalance(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftShowBalanceTab();
    return await this.myPage.isGiftShowBalanceContentVisible();
  }

  /** 나의 쇼핑 현황 > 거래 증빙 서류 신청/조회 확인 */
  async verifyTaxList(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickTaxListTab();
    return await this.myPage.isTaxListContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 배송지 관리 확인 */
  async verifyDeliveryAddress(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickDeliveryAddressTab();
    await this.waitForManualAuthenticationIfNeeded();
    const visible = await this.myPage.isDeliveryAddressContentVisible();
    if (visible) await this.myPage.wait(3);
    return visible;
  }

  /** 나의 쇼핑 정보 관리 > 연락처 관리 확인 */
  async verifyPhoneAddress(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickPhoneAddressTab();
    await this.waitForManualAuthenticationIfNeeded();
    const visible = await this.myPage.isPhoneAddressContentVisible();
    if (visible) await this.myPage.wait(2);
    return visible;
  }

  /** 나의 쇼핑 정보 관리 > 환불 계좌 관리 확인 */
  async verifyRefundAccount(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickRefundAccountTab();
    return await this.myPage.isRefundAccountContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 선물 메시지 관리 확인 */
  async verifyGiftMessage(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftMessageTab();
    return await this.myPage.isGiftMessageContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 알파포인트 확인 */
  async verifyAlphaPoint(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickAlphaPointTab();
    return await this.myPage.isAlphaPointContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 이용권등록 확인 */
  async verifyTicket(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickTicketTab();
    return await this.myPage.isTicketContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 방송 알림 설정 확인 */
  async verifyBroadcastNotification(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickBroadcastNotificationTab();
    return await this.myPage.isBroadcastNotificationContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 간편 로그인 연결 확인 */
  async verifySimpleLogin(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickSimpleLoginTab();
    return await this.myPage.isSimpleLoginContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 회원 정보 수정 확인 */
  async verifyModifyCustomerInfo(name: string, year: string, month: string, day: string, phoneNumber: string): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickModifyCustomerInfoTab();
    // 본인인증
    const modal = await this.myPage.isModalVisible();
    await parameter('본인인증', `${modal}`);

    if (modal) {
      await notifyManualAuth('PC', '본인인증');
      return await this.myPage.isModifyCustomerInfoContentVisible(300);
    }

    return await this.myPage.isModifyCustomerInfoContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 혜택 관리 확인 */
  async verifyBenefit(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickBenefitTab();
    await this.waitForManualAuthenticationIfNeeded();
    return await this.myPage.isBenefitContentVisible();
  }

  /** 나의 쇼핑 정보 관리 > 회원 탈퇴 본인인증 화면 이동 확인 */
  async verifyWithdrawal(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickWithdrawalTab();
    if (await this.myPage.isWithdrawalContentVisible(2).catch(() => false)) {
      await parameter('본인인증 상태', '기존 인증 유효');
      return true;
    }
    const authVisible = await this.myPage.isWithdrawalAuthVisible();
    await parameter('본인인증 화면', authVisible ? '정상 노출' : '진입 실패');
    if (!authVisible) return false;
    await notifyManualAuth('PC', '본인인증');
    const contentVisible = await this.myPage.isWithdrawalContentVisible();
    await parameter('탈퇴 안내 화면', contentVisible ? '정상 노출' : '노출 실패');
    return contentVisible;
  }

  /** 나의 쇼핑 활동 > 장바구니 */
  async verifyCart(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickCartTab();
    return await this.myPage.isCartContentVisible();
  }

  /** 나의 쇼핑 활동 > 좋아요 */
  async verifyLike(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickLikeTab();
    return await this.myPage.isLikeContentVisible();
  }

  /** 나의 쇼핑 활동 > 상품평 */
  async verifyReview(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickReviewTab();
    return await this.myPage.isReviewContentVisible();
  }

  /** 나의 쇼핑 활동 > 최근 본 상품 */
  async verifyRecently(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickRecentlyTab();
    return await this.myPage.isRecentlyContentVisible();
  }

  /** 고객 센터 > 1:1 문의하기 */
  async verifyInquiry(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickInquiryTab();
    return await this.myPage.isInquiryContentVisible();
  }

  /** 고객 센터 > 문의 내역 */
  async verifyInquiryList(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickInquiryListTab();
    return await this.myPage.isInquiryListContentVisible();
  }

  /** 고객 센터 > 공지 사항 */
  async verifyNotice(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickNoticeTab();
    return await this.myPage.isNoticeContentVisible();
  }

  /** 고객 센터 > 자주하는 질문 */
  async verifyFaq(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickFaqTab();
    return await this.myPage.isFaqContentVisible();
  }
}
