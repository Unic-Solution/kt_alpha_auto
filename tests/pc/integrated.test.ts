import { test } from '../../fixtures/web/pc.fixture';
import { LoginSteps } from '../../steps/pc/login.steps';
import { MainSteps } from '../../steps/pc/main.steps';
import { ProductSteps } from '../../steps/pc/product.steps';
import { productCases } from '../../steps/pc/product.cases';
import { QuickSteps } from '../../steps/pc/quick.steps';
import { MySteps } from '../../steps/pc/my.steps';
import { GsMainSteps } from '../../steps/pc/gs_main.steps';
import { GsProductSteps } from '../../steps/pc/gs_product.steps';
import { createRun } from '../../utils/step-runner';

const ENV = {
  name: process.env.NAME ?? '',
  year: process.env.YEAR ?? '',
  month: process.env.MONTH ?? '',
  day: process.env.DAY ?? '',
  phoneNumber: process.env.PHONE_NUMBER ?? '',
};

test('통합 테스트', async ({ sharedBasePage }) => {
  test.setTimeout(1_500_000);

  const loginSteps = new LoginSteps(sharedBasePage);
  const mainSteps = new MainSteps(sharedBasePage);
  const productSteps = new ProductSteps(sharedBasePage);
  const quickSteps = new QuickSteps(sharedBasePage);
  const mySteps = new MySteps(sharedBasePage);
  const gsMainSteps = new GsMainSteps(sharedBasePage);
  const gsProductSteps = new GsProductSteps(sharedBasePage);

  const run = createRun('PC Web', '통합 테스트', sharedBasePage.getPage());

  await run('[테스트케이스 1번] GNB 메뉴별 화면 스크롤 후 메뉴 노출', () => mainSteps.verifyAllNavItems());
  await run('[테스트케이스 2번] ON AIR 현재 방송 상품 정보 노출', () => mainSteps.verifyOnAirModal());
  await run('[테스트케이스 3번] ON AIR 바로구매에서 선물하기', () => mainSteps.verifyOnAirGift());
  await run('[테스트케이스 4번] ON AIR 바로구매에서 장바구니', () => mainSteps.verifyOnAirCart());
  await run('[테스트케이스 5번] ON AIR 바로구매에서 구매하기', () => mainSteps.verifyOnAirBuy());
  await run('[테스트케이스 6번] 이전·다음 방송', () => mainSteps.verifyAdjacentBroadcasts());
  await run('[테스트케이스 7번] 탭바', () => quickSteps.verifyFixedNavigation());
  await run('[테스트케이스 8번] 카테고리', () => mainSteps.verifyCategory());
  await run('[테스트케이스 9번] 검색', () => mainSteps.verifySearch());
  await run('[테스트케이스 10번] 일반 계정 로그인 확인', () => loginSteps.verifyLocalLogin());
  await run('[테스트케이스 12번] 상품 구매하기에서 일반 계정 로그인', () => loginSteps.verifyBuyAndLogin());

  for (const item of productCases) {
    await run(`[테스트케이스 ${item.number}번] ${item.name}`, () => item.run(productSteps));
  }

  await run('[테스트케이스 40번] 주문 내역', () => mySteps.verifyOrderHistory());
  await run('[테스트케이스 41번] 취소·교환·반품', () => mySteps.verifyClaimHistory());
  await run('[테스트케이스 42번] 기프티쇼 선물함', () => mySteps.verifyGiftShow());
  await run('[테스트케이스 43번] 잔액형 상품권 내역', () => mySteps.verifyGiftShowBalance());
  await run('[테스트케이스 44번] 거래 증빙 서류', () => mySteps.verifyTaxList());
  await run('[테스트케이스 45번] 배송지 관리', () => mySteps.verifyDeliveryAddress());
  await run('[테스트케이스 46번] 연락처 관리', () => mySteps.verifyPhoneAddress());
  await run('[테스트케이스 47번] 환불 계좌 관리', () => mySteps.verifyRefundAccount());
  await run('[테스트케이스 48번] 선물 메시지 관리', () => mySteps.verifyGiftMessage());
  await run('[테스트케이스 49번] 알파포인트', () => mySteps.verifyAlphaPoint());
  await run('[테스트케이스 50번] 이용권 등록', () => mySteps.verifyTicket());
  await run('[테스트케이스 51번] 방송 알림 설정', () => mySteps.verifyBroadcastNotification());
  await run('[테스트케이스 52번] 간편 로그인 연결', () => mySteps.verifySimpleLogin());
  await run('[테스트케이스 53번] 회원 정보 수정', () => mySteps.verifyModifyCustomerInfo(ENV.name, ENV.year, ENV.month, ENV.day, ENV.phoneNumber));
  await run('[테스트케이스 54번] 혜택 관리', () => mySteps.verifyBenefit());
  await run('[테스트케이스 55번] 회원 탈퇴', () => mySteps.verifyWithdrawal());
  await run('[테스트케이스 56번] 장바구니', () => mySteps.verifyCart());
  await run('[테스트케이스 57번] 좋아요', () => mySteps.verifyLike());
  await run('[테스트케이스 58번] 상품평', () => mySteps.verifyReview());
  await run('[테스트케이스 59번] 최근 본 상품', () => mySteps.verifyRecently());
  await run('[테스트케이스 60번] 1:1 문의하기', () => mySteps.verifyInquiry());
  await run('[테스트케이스 61번] 문의 내역', () => mySteps.verifyInquiryList());
  await run('[테스트케이스 62번] 공지 사항', () => mySteps.verifyNotice());
  await run('[테스트케이스 63번] 자주하는 질문', () => mySteps.verifyFaq());

  await run('[테스트케이스 64번] 기프티쇼 GNB', () => gsMainSteps.gsVerifyAllNavItems());
  await run('[테스트케이스 65번] 기프티쇼 카테고리', () => gsMainSteps.gsVerifyCategory());
  await run('[테스트케이스 66번] 기프티쇼 검색', () => gsMainSteps.gsVerifySearch());

  await run('[테스트케이스 67번] 기프티쇼 상품 좋아요', () => gsProductSteps.gsVerifyProductLike());
  await run('[테스트케이스 68번] 기프티쇼 상품 상세정보', () => gsProductSteps.gsVerifyProductDetailInfo());
  await run('[테스트케이스 69번] 기프티쇼 상품 구매정보', () => gsProductSteps.gsVerifyProductBuyInfo());
  await run('[테스트케이스 70번] 기프티쇼 나에게 보내기', () => gsProductSteps.gsVerifyProductSendToMe());
  await run('[테스트케이스 71번] 기프티쇼 바로구매', () => gsProductSteps.gsVerifyProductGift());
  await run('[테스트케이스 74번] 기프티쇼 대표 번호', () => gsProductSteps.gsVerifyGiftShowMainPhoneNumber(ENV.name));
  await run('[테스트케이스 75번] 내 번호', () => gsProductSteps.gsVerifyMyPhoneNumber(ENV.name));
  await run('[테스트케이스 77번] 다른 사람에게 보내기', () => gsProductSteps.gsVerifyRecipient(ENV.phoneNumber, ENV.name));
  await run('[테스트케이스 78번] 선물 꾸미기 배너·카드 이미지', () => gsProductSteps.gsVerifyGiftDecoration());
  await run('[테스트케이스 79번] 선물 꾸미기 메시지', () => gsProductSteps.gsVerifyGiftMessage('감사합니다.'));
  await run('[테스트케이스 80번] 기프티쇼 결제 진행', () => gsProductSteps.gsVerifyPayment(ENV.phoneNumber, ENV.name));
  await run('[테스트케이스 83번] 최근 본 상품 추천 구좌', () => mainSteps.verifyRecentlyViewedProductRecommend());
  await run('[테스트케이스 90번] 편성표 TV·TV+ 현재 방송 상품', () => mainSteps.verifyScheduleChannelTabs());
  await run('[테스트케이스 91번] 혜택/기획전 페이지 이동 확인', () => mainSteps.verifyBenefitSpecialPlan());
  await run('[테스트케이스 92번] 오늘의 혜택 기획전 이동 확인', () => mainSteps.verifyTodayBenefit());
  await run('[테스트케이스 93번] 이달의 카드 혜택 페이지 이동 확인', () => mainSteps.verifyMonthlyCardBenefits());
  await run('[테스트케이스 94번] 쇼핑 TIP 프로모션 페이지 이동 확인', () => mainSteps.verifyShoppingTipPromotion());
});
