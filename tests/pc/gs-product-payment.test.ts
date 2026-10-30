import { defineGsProductTest } from './define-gs-product-test';

defineGsProductTest(80, '기프티쇼 결제 진행', steps => steps.gsVerifyPayment(
  process.env.PHONE_NUMBER ?? '',
  process.env.NAME ?? '',
));
