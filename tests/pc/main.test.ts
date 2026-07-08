import { test } from '../../fixtures/web/pc.fixture';
import { MainSteps } from '../../steps/pc/main.steps';
import { createRun } from '../../utils/step-runner';

const ENV = {
  combinedProduct: process.env.COMBINED_PRODUCT_CODE ?? '',
};

test('메인 페이지', async ({ basePage }) => {
  const mainSteps = new MainSteps(basePage);
  const run = createRun('PC Web', '메인 페이지', basePage.getPage());

  await run('GNB 메뉴별 화면 확인', () => mainSteps.verifyAllNavItems());
  await run('ON AIR > 현재 방송 중인 상품 정보 노출 확인', () => mainSteps.verifyOnAirModal());
  await run('ON AIR > 바로구매 > 선물하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirGift());
  await run('ON AIR > 바로구매 > 장바구니 상품 추가 확인', () => mainSteps.verifyOnAirCart());
  await run('ON AIR > 바로구매 > 구매하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirBuy());
  await run('카테고리 정상 노출 및 필터 기능 확인', () => mainSteps.verifyCategory());
  await run('검색 후 상품 상세 페이지 이동 확인', () => mainSteps.verifySearch());
  await run('최근 본 상품 추천구좌 상품 및 페이지 이동 확인', () => mainSteps.verifyRecentlyViewedProductRecommend());
  await run('묶음 배송 추천구좌 상품 및 페이지 이동 확인', () => mainSteps.verifyCombinedProductRecommend(ENV.combinedProduct));
  await run('카테고리 추천구좌 상품 및 페이지 이동 확인', () => mainSteps.verifyCategoryRecommend());
  await run('검색 추천구좌 상품 및 페이지 이동 확인', () => mainSteps.verifySearchRecommend());
  await run('상품(선택 후 뒤로가기) 추천구좌 상품 및 페이지 이동 확인', () => mainSteps.verifyProductRecommend());
  await run('편성표 > TV/TV+ 탭 > 지금 방송 중 상품 확인', () => mainSteps.verifyScheduleOnAir());
  await run('혜택/이벤트 > 신규가입 혜택 페이지 이동 확인', () => mainSteps.verifyNewSignBenefit());
  await run('혜택/이벤트 > 이달의 선물 페이지 이동 확인', () => mainSteps.verifyMonthGift());
  await run('혜택/이벤트 > 멤버십 혜택 페이지 이동 확인', () => mainSteps.verifyMembershipBenefit());
  await run('혜택/이벤트 > 수신동의 쿠폰팩 페이지 이동 확인', () => mainSteps.verifyAgreeReceive());
});
