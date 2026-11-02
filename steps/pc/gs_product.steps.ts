import { BasePage } from '../../pages/common/BasePage';
import { GsProductPage } from '../../pages/web/pc/gs_product.page';
import { parameter } from '../../utils/step-runner';

export class GsProductSteps {
  private gsProductPage: GsProductPage;

  constructor(basePage: BasePage) {
    this.gsProductPage = new GsProductPage(basePage.getPage());
  }

  /** 번호별 개별 실행을 위해 선물 주문서를 독립적으로 준비한다. */
  private async openGiftOrder() {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductGift();
    if (!await this.gsProductPage.isGiftOrderPage()) throw new Error('기프티쇼 선물 주문서로 이동하지 못했습니다.');
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

  /** 기프티쇼 > 상품 > 선물하기 주문서 이동 및 주문서 기능 확인 */
  async gsVerifyProductGift(): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductGift();
    return await this.gsProductPage.isGiftOrderPage();
  }

  /** 기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표 번호로 보내기 확인 */
  async gsVerifyGiftShowMainPhoneNumber(name: string): Promise<boolean> {
    await this.openGiftOrder();
    await this.gsProductPage.clickGiftShowMainPhoneNumberButton();
    const empty = await this.gsProductPage.isSenderInputEmpty();
    const verify = await this.gsProductPage.fillAndVerify(name);
    await parameter('기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표번호로 보내기 > 보내는 사람 input Empty 여부', `${empty}`);
    await parameter('기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표번호로 보내기 > 보내는 사람 input 정상 입력 여부', `${verify}`);
    return empty && verify;
  }

  /** 기프티쇼 > 상품 > 선물하기 > 내 번호로 보내기 확인 */
  async gsVerifyMyPhoneNumber(name: string): Promise<boolean> {
    await this.openGiftOrder();
    await this.gsProductPage.clickMyPhoneNumberButton();
    const value = await this.gsProductPage.getSenderInputValue();
    await parameter('기프티쇼 > 상품 > 선물하기 > 내 번호로 보내기 > 보내는 사람 input 값', value);
    await parameter('비교할 회원명', name);
    return value.slice(0, 2) === name.slice(0, 2);
  }

  /** 기프티쇼 > 상품 > 선물하기 > 받는 사람 확인 */
  async gsVerifyRecipient(phoneNumber:string, name: string): Promise<boolean> {
    if (!phoneNumber || !name) {
      throw new Error('GitHub Actions Secrets의 PHONE_NUMBER와 NAME을 설정해야 합니다.');
    }
    await this.openGiftOrder();
    const beforeRecipients = await this.gsProductPage.extractTotalRecipients();
    if (beforeRecipients === false) throw new Error('상단 받는 사람 인원 수를 확인할 수 없습니다.');
    await this.gsProductPage.fillRecipientPhoneNumber(phoneNumber);
    await this.gsProductPage.fillRecipientName(name);
    await this.gsProductPage.waitForTotalRecipients(beforeRecipients + 1);
    const afterRecipients = await this.gsProductPage.extractTotalRecipients();
    if (afterRecipients === false) throw new Error('입력 후 상단 받는 사람 인원 수를 확인할 수 없습니다.');
    await parameter('받는 사람 입력 전', `${beforeRecipients}`);
    await parameter('받는 사람 입력 후', `${afterRecipients}`);
    return beforeRecipients < afterRecipients;
  }

  /** 기프티쇼 > 상품 > 선물하기 > 결제 진행 및 상품 결제 페이지 이동 확인 */
  async gsVerifyPayment(phoneNumber: string, name: string): Promise<boolean> {
    if (!phoneNumber || !name) throw new Error('GitHub Actions Secrets의 PHONE_NUMBER와 NAME을 설정해야 합니다.');
    await this.openGiftOrder();
    await this.gsProductPage.clickGiftShowMainPhoneNumberButton();
    if (!await this.gsProductPage.isSenderInputEmpty()) throw new Error('보내는 사람 입력란의 초기값이 비어 있지 않습니다.');
    if (!await this.gsProductPage.fillAndVerify(name)) throw new Error('보내는 사람 이름이 정상적으로 입력되지 않았습니다.');
    const beforeRecipients = await this.gsProductPage.extractTotalRecipients();
    if (beforeRecipients === false) throw new Error('상단 받는 사람 인원 수를 확인할 수 없습니다.');
    await this.gsProductPage.fillRecipientPhoneNumber(phoneNumber);
    await this.gsProductPage.fillRecipientName(name);
    await this.gsProductPage.waitForTotalRecipients(beforeRecipients + 1);
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

  /** 기프티쇼 > 선물 메시지 직접 입력·추천·특수문자·수정 확인 */
  async gsVerifyGiftMessage(message: string): Promise<boolean> {
    await this.gsProductPage.clickProduct();
    await this.gsProductPage.clickProductGift();
    if (!await this.gsProductPage.isGiftOrderPage()) return false;
    const recommended = await this.gsProductPage.selectAndVerifyRecommendedMessage();
    const direct = await this.gsProductPage.fillAndVerifyGiftMessage(message);
    const specialCharacter = await this.gsProductPage.selectAndVerifySpecialCharacter();
    await parameter('추천 메시지 선택·반영', `${recommended}`);
    await parameter('전체 삭제 후 직접 입력', `${direct} (${message})`);
    await parameter('특수문자 선택·추가', `${specialCharacter}`);
    return recommended && direct && specialCharacter;
  }
}
