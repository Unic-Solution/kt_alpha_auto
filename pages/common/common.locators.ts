// PC/MW 공통으로 사용되는 locator
export const CommonLocators = {
  urls: {
    homePage: process.env.BASE_URL ?? 'https://www.kshop.co.kr/',
    mwHomePage: process.env.MW_BASE_URL ?? 'https://m.kshop.co.kr/',
  },
  modal: {
    modal: '//div[contains(@class,"Modal_open")]',
    closeBtn: '//button[normalize-space(.)="닫기"]',
    confirmButton: '//span[text()="확인"]',
  },
  button: {
    giftShowButton: '//button[text()="기프티쇼"]',
  }
};
