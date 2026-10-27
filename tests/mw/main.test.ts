import { test } from '../../fixtures/web/mw.fixture';
import { MainSteps } from '../../steps/mw/main.steps';
import { createRun } from '../../utils/step-runner';

test('메인 페이지 (MW)', async ({ basePage }) => {
  const mainSteps = new MainSteps(basePage);
  const run = createRun('MW Web', '메인 페이지', basePage.getPage());

  await run('GNB 메뉴별 화면 확인', () => mainSteps.verifyAllNavItems());
  await run('ON AIR > 현재 방송 중인 상품 정보 노출 확인', () => mainSteps.verifyOnAirModal());
  await run('ON AIR > 바로구매 > 선물하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirGift());
  await run('ON AIR > 바로구매 > 장바구니 상품 추가 확인', () => mainSteps.verifyOnAirCart());
  await run('ON AIR > 바로구매 > 구매하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirBuy());
  await run('이전·다음 방송 노출 및 편성표·상품 상세 이동 확인', () => mainSteps.verifyAdjacentBroadcasts());
  await run('카테고리 정상 노출 및 필터 기능 확인', () => mainSteps.verifyCategory());
  await run('검색 후 상품 상세 페이지 이동 확인', () => mainSteps.verifySearch());
});
