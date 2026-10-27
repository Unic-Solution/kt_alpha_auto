import { expect, test } from '@playwright/test';
import { BasePage } from '../../pages/common/BasePage';
import { QuickPage } from '../../pages/web/mw/quick.page';
import { parameter } from '../../utils/step-runner';

export class QuickSteps {
  private quickPage: QuickPage;

  constructor(basePage: BasePage) {
    this.quickPage = new QuickPage(basePage.getPage());
  }

  /** 체크리스트 7: 화면을 초기화하지 않고 고정 메뉴를 연속 클릭한다. */
  async verifyFixedNavigation(): Promise<boolean> {
    await this.quickPage.prepareFixedNavigation();
    const checks = [
      ['홈', () => this.quickPage.verifyFixedHome()],
      ['카테고리', () => this.quickPage.verifyFixedCategory()],
      ['마이', () => this.quickPage.verifyFixedMy()],
      ['기프티쇼', () => this.quickPage.verifyFixedGiftShow()],
      ['KT알파쇼핑', () => this.quickPage.verifyFixedAlphaShopping()],
      ['TOP', () => this.quickPage.verifyFixedTop()],
    ] as const;
    for (const [name, check] of checks) {
      const from = this.quickPage.getCurrentURL();
      await test.step(`고정 메뉴 > ${name}`, async () => { expect(await check()).toBe(true); });
      parameter('고정 메뉴 ' + name, '통과');
      console.log(`[고정 메뉴 연속 이동] ${name}: ${from} → ${this.quickPage.getCurrentURL()}`);
      if (name === '기프티쇼' || name === 'TOP') {
        const file = test.info().outputPath(`fixed-menu-${name === 'TOP' ? 'top' : 'gift'}.png`);
        await this.quickPage.getPage().screenshot({ path: file });
        await test.info().attach('고정 메뉴 ' + name, { path: file, contentType: 'image/png' });
      }
    }
    return true;
  }

  /** 독바 > ON AIR > 바로구매 > 선물하기 주문서 이동 확인 */
  async verifyOnAirGift(): Promise<boolean> {
    const counsel = await this.quickPage.selectOnAirOption();
    if (!counsel) return await this.quickPage.isBuyOrderPage();
    await this.quickPage.clickOnAirGiftButton();
    return await this.quickPage.isGiftOrderPage();
  }

  /** 독바 > ON AIR > 바로구매 > 장바구니 상품 추가 확인 */
  async verifyOnAirCart(): Promise<boolean> {
    await this.quickPage.selectOnAirOption();
    const onAirProductName = await this.quickPage.getOnAirProductName();
    const clicked = await this.quickPage.clickOnAirCartButton();
    if (!clicked) {
      await parameter('독바 > ON AIR > 바로구매 > 장바구니', '장바구니 버튼 없는 케이스');
      return true;
    }

    await this.quickPage.clickOnAirCartMoveButton();
    const cartProductName = await this.quickPage.getCartProductName();
    await this.quickPage.clickCartDeleteButton();

    await parameter('ON AIR 상품명', onAirProductName);
    await parameter('장바구니 상품명', cartProductName);

    return cartProductName.includes(onAirProductName);
  }

  /** 독바 > ON AIR > 바로구매 > 구매하기 주문서 이동 확인 */
  async verifyOnAirBuy(): Promise<boolean> {
    await this.quickPage.selectOnAirOption();
    await this.quickPage.clickOnAirBuyButton();
    return await this.quickPage.isBuyOrderPage();
  }
}
