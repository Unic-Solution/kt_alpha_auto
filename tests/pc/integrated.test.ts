import { test } from '../../fixtures/web/pc.fixture';
import { LoginSteps } from '../../steps/pc/login.steps';
import { MainSteps } from '../../steps/pc/main.steps';
import { ProductSteps } from '../../steps/pc/product.steps';
import { QuickSteps } from '../../steps/pc/quick.steps';
import { MySteps } from '../../steps/pc/my.steps';
import { GsMainSteps } from '../../steps/pc/gs_main.steps';
import { GsProductSteps } from '../../steps/pc/gs_product.steps';
import { createRun } from '../../utils/step-runner';

const ENV = {
  id: process.env.LOGIN_ID ?? '',
  pw: process.env.LOGIN_PW ?? '',
  name: process.env.NAME ?? '',
  year: process.env.YEAR ?? '',
  month: process.env.MONTH ?? '',
  day: process.env.DAY ?? '',
  phoneNumber: process.env.PHONE_NUMBER ?? '',
};


test('통합 테스트', async ({ sharedBasePage }) => {
  test.setTimeout(1_200_000);

  const loginSteps = new LoginSteps(sharedBasePage);
  const mainSteps = new MainSteps(sharedBasePage);
  const productSteps = new ProductSteps(sharedBasePage);
  const quickSteps = new QuickSteps(sharedBasePage);
  const mySteps = new MySteps(sharedBasePage);
  const gsMainSteps = new GsMainSteps(sharedBasePage);
  const gsProductSteps = new GsProductSteps(sharedBasePage);

  const run = createRun('PC Web', '통합 테스트', sharedBasePage.getPage());

  await run('일반 계정 로그인 확인', () => loginSteps.verifyLocalLogin(ENV.id, ENV.pw));
  await run('임의 상품 상세 > 구매하기 > 일반 계정 로그인 확인', () => loginSteps.verifyBuyAndLogin(ENV.id, ENV.pw), true);

  await run('GNB 메뉴별 화면 확인', () => mainSteps.verifyAllNavItems());
  await run('ON AIR > 현재 방송 중인 상품 정보 노출 확인', () => mainSteps.verifyOnAirModal());
  await run('ON AIR > 바로구매 > 선물하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirGift());
  await run('ON AIR > 바로구매 > 장바구니 상품 추가 확인', () => mainSteps.verifyOnAirCart());
  await run('ON AIR > 바로구매 > 구매하기 주문서 페이지 이동 확인', () => mainSteps.verifyOnAirBuy());
  await run('카테고리 정상 노출 및 필터 기능 확인', () => mainSteps.verifyCategory());
  await run('검색 후 상품 상세 페이지 이동 확인', () => mainSteps.verifySearch());

  await run('ON AIR > VOD 영상 재생 확인', () => productSteps.verifyVOD());
  await run('편성표 > 방송알림 신청 및 등록 완료 확인', () => productSteps.verifyBroadcastNotification());
  await run('상품 > 좋아요 추가 및 삭제 확인', () => productSteps.verifyProductLike());
  await run('상품 > 상세정보 탭 노출 확인', () => productSteps.verifyProductDetailInfo());
  await run('상품 > 구매정보 탭 노출 확인', () => productSteps.verifyProductBuyInfo());
  await run('상품 > 상품평 탭 노출 확인', () => productSteps.verifyProductReview());
  await run('상품 > 상품문의 탭 노출 확인', () => productSteps.verifyProductQna());
  await run('상품 > 선물하기 주문서 페이지 이동 확인', () => productSteps.verifyProductGift());
  await run('상품 > 장바구니 상품 추가 확인', () => productSteps.verifyProductCart());
  await run('상품 > 구매하기 주문서 페이지 이동 확인', () => productSteps.verifyProductBuy());

  await run('독바 > ON AIR > 바로구매 > 선물하기 주문서 페이지 이동 확인', () => quickSteps.verifyOnAirGift());
  await run('독바 > ON AIR > 바로구매 > 장바구니 상품 추가 확인', () => quickSteps.verifyOnAirCart());
  await run('독바 > ON AIR > 바로구매 > 구매하기 주문서 페이지 이동 확인', () => quickSteps.verifyOnAirBuy());

  await run('주문 내역 확인', () => mySteps.verifyOrderHistory());
  await run('취소/교환/반품 내역 확인', () => mySteps.verifyClaimHistory());
  await run('기프티쇼 선물함 확인', () => mySteps.verifyGiftShow());
  await run('잔액형 상품권 내역 확인', () => mySteps.verifyGiftShowBalance());
  await run('거래 증빙 서류 신청/조회 확인', () => mySteps.verifyTaxList());
  await run('배송지 관리 확인', () => mySteps.verifyDeliveryAddress());
  await run('연락처 관리 확인', () => mySteps.verifyPhoneAddress());
  await run('환불 계좌 관리 확인', () => mySteps.verifyRefundAccount());
  await run('선물 메시지 관리 확인', () => mySteps.verifyGiftMessage());
  await run('알파포인트 확인', () => mySteps.verifyAlphaPoint());
  await run('이용권등록 확인', () => mySteps.verifyTicket());
  await run('방송 알림 설정 확인', () => mySteps.verifyBroadcastNotification());
  await run('간편 로그인 연결 확인', () => mySteps.verifySimpleLogin());
  await run('회원 정보 수정 확인', () => mySteps.verifyModifyCustomerInfo(ENV.name, ENV.year, ENV.month, ENV.day, ENV.phoneNumber));
  await run('혜택 관리 확인', () => mySteps.verifyBenefit());
  await run('장바구니 확인', () => mySteps.verifyCart());
  await run('좋아요 확인', () => mySteps.verifyLike());
  await run('상품평 확인', () => mySteps.verifyReview());
  await run('최근 본 상품 확인', () => mySteps.verifyRecently());
  await run('1:1 문의하기 확인', () => mySteps.verifyInquiry());
  await run('문의 내역 확인', () => mySteps.verifyInquiryList());
  await run('공지 사항 확인', () => mySteps.verifyNotice());
  await run('자주하는 질문 확인', () => mySteps.verifyFaq());

  await run('기프티쇼 GNB 메뉴별 화면 노출 확인', () => gsMainSteps.gsVerifyAllNavItems());
  await run('기프티쇼 카테고리 및 필터 기능 확인', () => gsMainSteps.gsVerifyCategory());
  await run('기프티쇼 검색 후 상품 상세 페이지 이동 확인', () => gsMainSteps.gsVerifySearch());

  await run('기프티쇼 > 상품 > 좋아요 추가 및 삭제 확인', () => gsProductSteps.gsVerifyProductLike());
  await run('기프티쇼 > 상품 > 상세정보 탭 노출 확인', () => gsProductSteps.gsVerifyProductDetailInfo());
  await run('기프티쇼 > 상품 > 구매정보 탭 노출 확인', () => gsProductSteps.gsVerifyProductBuyInfo());
  await run('기프티쇼 > 상품 > 선물하기 주문서 이동 확인', () => gsProductSteps.gsVerifyProductGift());
  await run('기프티쇼 > 상품 > 선물하기 > 기프티쇼 대표 번호로 보내기 확인', () => gsProductSteps.gsVerifyGiftShowMainPhoneNumber(ENV.name));
  await run('기프티쇼 > 상품 > 선물하기 > 내 번호로 보내기 확인', () => gsProductSteps.gsVerifyMyPhoneNumber(ENV.name));
  await run('기프티쇼 > 상품 > 선물하기 > 받는 사람 확인', () => gsProductSteps.gsVerifyRecipient(ENV.phoneNumber, ENV.name));
  await run('기프티쇼 > 상품 > 선물하기 > 결제 진행 및 상품 결제 페이지 이동 확인', () => gsProductSteps.gsVerifyPayment());
  await run('기프티쇼 > 상품 > 나에게 보내기 주문서 이동 확인', () => gsProductSteps.gsVerifyProductSendToMe());
});
