import { defineGsProductTest } from './define-gs-product-test';

defineGsProductTest(74, '기프티쇼 대표 번호', steps => steps.gsVerifyGiftShowMainPhoneNumber(process.env.NAME ?? ''));
