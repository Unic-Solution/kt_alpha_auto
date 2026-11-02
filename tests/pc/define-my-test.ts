import { test } from '../../fixtures/web/pc.fixture';
import { MySteps } from '../../steps/pc/my.steps';
import { createRun } from '../../utils/step-runner';

export function defineMyTest(number: number, name: string, verify: (steps: MySteps) => Promise<boolean>) {
  test(`[테스트케이스 ${number}번] ${name}`, async ({ basePage }) => {
    const steps = new MySteps(basePage);
    await createRun('PC Web', `테스트케이스 ${number}번`, basePage.getPage())(name, () => verify(steps), true);
  });
}
