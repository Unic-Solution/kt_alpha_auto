import { test } from '../../fixtures/web/pc.fixture';
import { GsProductSteps } from '../../steps/pc/gs_product.steps';
import { createRun } from '../../utils/step-runner';

export function defineGsProductTest(number: number, name: string, verify: (steps: GsProductSteps) => Promise<boolean>) {
  test(`[테스트케이스 ${number}번] ${name}`, async ({ basePage }) => {
    const steps = new GsProductSteps(basePage);
    await createRun('PC Web', `테스트케이스 ${number}번`, basePage.getPage())(name, () => verify(steps), true);
  });
}
