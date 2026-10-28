import { BasePage } from '../../pages/common/BasePage';
import { GsProductPage } from '../../pages/web/mw/gs_product.page';
import { parameter } from '../../utils/step-runner';

export class GsProductSteps {
  private gsProductPage: GsProductPage;

  constructor(basePage: BasePage) {
    this.gsProductPage = new GsProductPage(basePage.getPage());
  }

  /** 기프티쇼 > 상품 > 좋아요 추가 및 삭제 확인 */
  async gsVerifyProductLike(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductLikeButton();
    await this.gsProductPage.gotoLikePage();
    const likePageLikeButtonBefore = await this.gsProductPage.isLikeButtonVisible();
    await this.gsProductPage.clickLikePageLikeButton();
    const likePageLikeButtonAfter = await this.gsProductPage.isLikeButtonVisible();

    await parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 전)', `${likePageLikeButtonBefore}`);
    await parameter('마이페이지 > 좋아요 > 좋아요 버튼(클릭 후)', `${likePageLikeButtonAfter}`);

    return likePageLikeButtonBefore && !likePageLikeButtonAfter;
  }

  /** 기프티쇼 > 상품 > 상세정보 탭 노출 확인 */
  async gsVerifyProductDetailInfo(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductDetailInfoTab();
    return await this.gsProductPage.isProductDetailInfoVisible();
  }

  /** 기프티쇼 > 상품 > 구매정보 탭 노출 확인 */
  async gsVerifyProductBuyInfo(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductBuyInfoTab();
    return await this.gsProductPage.isProductBuyInfoVisible();
  }

  /** 기프티쇼 > 상품 > 선물하기 주문서 이동 확인 */
  async gsVerifyProductGift(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductGift();
    return await this.gsProductPage.isGiftOrderPage();
  }

  /** 기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표 번호로 보내기 확인 */
  async gsVerifyGiftShowMainPhoneNumber(name: string): Promise<boolean> {
    await this.gsProductPage.clickGiftShowMainPhoneNumberButton();
    const empty = await this.gsProductPage.isSenderInputEmpty();
    const verify = await this.gsProductPage.fillAndVerify(name);
    await parameter('기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표번호로 보내기 > 보내는 사람 input Empty 여부', `${empty}`);
    await parameter('기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표번호로 보내기 > 보내는 사람 input 정상 입력 여부', `${verify}`);
    return empty && verify;
  }

  /** 기프티쇼 > 상품 > 선물하기 > 내 번호로 보내기 확인 */
  async gsVerifyMyPhoneNumber(name: string): Promise<boolean> {
    await this.gsProductPage.clickMyPhoneNumberButton();
    const value = await this.gsProductPage.getSenderInputValue();
    await parameter('기프티쇼 > 상품 > 선물하기 > 내 번호로 보내기 > 보내는 사람 input 값', value);
    await parameter('비교할 회원명', name);
    return value.slice(0, 2) === name.slice(0, 2);
  }

  /** 기프티쇼 > 상품 > 선물하기 > 받는 사람 확인 */
  async gsVerifyRecipient(phoneNumber: string, name: string): Promise<boolean> {
    const beforeRecipients = await this.gsProductPage.extractTotalRecipients();
    await this.gsProductPage.fillRecipientPhoneNumber(phoneNumber);
    await this.gsProductPage.fillRecipientName(name);
    const afterRecipients = await this.gsProductPage.extractTotalRecipients();
    await parameter('받는 사람 입력 전', `${beforeRecipients}`);
    await parameter('받는 사람 입력 후', `${afterRecipients}`);
    return beforeRecipients < afterRecipients;
  }

  /** 기프티쇼 > 상품 > 선물하기 > 결제 진행 및 상품 결제 페이지 이동 확인 */
  async gsVerifyPayment(): Promise<boolean> {
    await this.gsProductPage.clickPaymentButton();
    return await this.gsProductPage.isPaymentPage();
  }

  /** 기프티쇼 > 상품 > 나에게 보내기 주문서 이동 확인 */
  async gsVerifyProductSendToMe(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickSendToMeButton();
    await this.gsProductPage.reClickSendToMeButton();
    return await this.gsProductPage.isPaymentPage();
  }

  /** 기프티쇼 > 선물 꾸미기 > 배너·카드 이미지 선택 및 적용 확인 */
  async gsVerifyGiftDecoration(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductGift();
    if (!await this.gsProductPage.isGiftOrderPage()) return false;
    const banner = await this.gsProductPage.selectAndVerifyGiftBanner();
    const card = await this.gsProductPage.selectAndVerifyGiftCard();
    await parameter('배너 이미지 선택·적용', `${banner}`);
    await parameter('카드 이미지 선택·적용', `${card}`);
    return banner && card;
  }
}
