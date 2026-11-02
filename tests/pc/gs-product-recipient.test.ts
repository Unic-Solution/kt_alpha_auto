import { defineGsProductTest } from './define-gs-product-test';

defineGsProductTest(77, '다른 사람에게 보내기', steps => steps.gsVerifyRecipient(
  process.env.PHONE_NUMBER ?? '',
  process.env.NAME ?? '',
));
