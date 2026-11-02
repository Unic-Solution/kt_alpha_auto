import { defineGsProductTest } from './define-gs-product-test';

defineGsProductTest(75, '내 번호', steps => steps.gsVerifyMyPhoneNumber(process.env.NAME ?? ''));
