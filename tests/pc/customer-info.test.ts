import { defineMyTest } from './define-my-test';

defineMyTest(53, '회원 정보 수정', steps => steps.verifyModifyCustomerInfo(
  process.env.NAME ?? '',
  process.env.YEAR ?? '',
  process.env.MONTH ?? '',
  process.env.DAY ?? '',
  process.env.PHONE_NUMBER ?? '',
));
