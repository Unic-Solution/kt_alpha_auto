import { BasePage } from '../../pages/common/BasePage';
import { MyPage } from '../../pages/web/mw/my.page';
import { parameter } from '../../utils/step-runner';
import { notifyManualAuth } from '../../utils/manual-auth';

export class MySteps {
  private myPage: MyPage;

  constructor(basePage: BasePage) {
    this.myPage = new MyPage(basePage.getPage());
  }

  async verifyOrderHistory(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickOrderHistoryTab();
    return await this.myPage.isOrderListVisible();
  }

  async verifyClaimHistory(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickClaimHistoryTab();
    return await this.myPage.isOrderListVisible();
  }

  async verifyGiftShow(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftShowTab();
    return await this.myPage.isGiftShowContentVisible();
  }

  async verifyGiftShowBalance(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftShowBalanceTab();
    return await this.myPage.isGiftShowBalanceContentVisible();
  }

  async verifyTaxList(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickTaxListTab();
    return await this.myPage.isTaxListContentVisible();
  }

  async verifyDeliveryAddress(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickDeliveryAddressTab();
    return await this.myPage.isDeliveryAddressContentVisible();
  }

  async verifyPhoneAddress(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickPhoneAddressTab();
    return await this.myPage.isPhoneAddressContentVisible();
  }

  async verifyRefundAccount(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickRefundAccountTab();
    return await this.myPage.isRefundAccountContentVisible();
  }

  async verifyGiftMessage(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickGiftMessageTab();
    return await this.myPage.isGiftMessageContentVisible();
  }

  async verifyAlphaPoint(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickAlphaPointTab();
    return await this.myPage.isAlphaPointContentVisible();
  }

  async verifyTicket(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickTicketTab();
    return await this.myPage.isTicketContentVisible();
  }

  async verifyBroadcastNotification(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickBroadcastNotificationTab();
    return await this.myPage.isBroadcastNotificationContentVisible();
  }

  async verifySimpleLogin(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickSimpleLoginTab();
    return await this.myPage.isSimpleLoginContentVisible();
  }

  async verifyModifyCustomerInfo(name: string, year: string, month: string, day: string, phoneNumber: string): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickModifyCustomerInfoTab();
    const modal = await this.myPage.isModalVisible();
    await parameter('본인인증', `${modal}`);

    if (modal) {
      await this.myPage.fillName(name);
      await this.myPage.clickNextButton();
      await this.myPage.fillYear(year);
      await this.myPage.fillMonth(month);
      await this.myPage.fillDay(day);
      await this.myPage.clickKtAgencyButton();
      await this.myPage.fillPhoneNumber(phoneNumber);
      await this.myPage.wait(30);
    }

    return await this.myPage.isModifyCustomerInfoContentVisible();
  }

  async verifyBenefit(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickBenefitTab();
    return await this.myPage.isModifyCustomerInfoContentVisible();
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
    await notifyManualAuth('MW', '본인인증');
    const contentVisible = await this.myPage.isWithdrawalContentVisible();
    await parameter('탈퇴 안내 화면', contentVisible ? '정상 노출' : '노출 실패');
    return contentVisible;
  }

  async verifyCart(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickCartTab();
    return await this.myPage.isCartContentVisible();
  }

  async verifyLike(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickLikeTab();
    return await this.myPage.isLikeContentVisible();
  }

  async verifyReview(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickReviewTab();
    return await this.myPage.isReviewContentVisible();
  }

  async verifyRecently(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickRecentlyTab();
    return await this.myPage.isRecentlyContentVisible();
  }

  async verifyInquiry(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickInquiryTab();
    return await this.myPage.isInquiryContentVisible();
  }

  async verifyInquiryList(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickInquiryListTab();
    return await this.myPage.isInquiryListContentVisible();
  }

  async verifyNotice(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickNoticeTab();
    return await this.myPage.isNoticeContentVisible();
  }

  async verifyFaq(): Promise<boolean> {
    await this.myPage.clickMyButton();
    await this.myPage.clickFaqTab();
    return await this.myPage.isFaqContentVisible();
  }
}
