import { test } from '../../fixtures/web/pc.fixture';
import { defineGsProductTest } from './define-gs-product-test';

test.use({ requiresAuth: false });

defineGsProductTest(68, '기프티쇼 상품 상세정보', steps => steps.gsVerifyProductDetailInfo());
