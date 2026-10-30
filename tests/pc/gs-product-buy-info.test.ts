import { test } from '../../fixtures/web/pc.fixture';
import { defineGsProductTest } from './define-gs-product-test';

test.use({ requiresAuth: false });

defineGsProductTest(69, '기프티쇼 상품 구매정보', steps => steps.gsVerifyProductBuyInfo());
