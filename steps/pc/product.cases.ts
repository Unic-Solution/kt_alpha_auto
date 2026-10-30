import { ProductSteps } from './product.steps';

export const productCases = [
  { number: 14, name: '상품상세 VOD', run: (steps: ProductSteps) => steps.verifyVOD() },
  { number: 15, name: '방송알림', run: (steps: ProductSteps) => steps.verifyBroadcastNotification() },
  { number: 16, name: '상품 좋아요', run: (steps: ProductSteps) => steps.verifyProductLike() },
  { number: 17, name: '상품 상세정보', run: (steps: ProductSteps) => steps.verifyProductDetailInfo() },
  { number: 18, name: '상품 구매정보', run: (steps: ProductSteps) => steps.verifyProductBuyInfo() },
  { number: 19, name: '상품평', run: (steps: ProductSteps) => steps.verifyProductReview() },
  { number: 20, name: '상품문의', run: (steps: ProductSteps) => steps.verifyProductQna() },
  { number: 21, name: '일반상품 선물하기', run: (steps: ProductSteps) => steps.verifyProductGift() },
  { number: 22, name: '일반상품 장바구니', run: (steps: ProductSteps) => steps.verifyProductCart() },
  { number: 23, name: '일반상품 구매하기', run: (steps: ProductSteps) => steps.verifyProductBuy() },
] as const;
