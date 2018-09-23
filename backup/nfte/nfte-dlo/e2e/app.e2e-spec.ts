import { NfteDloPage } from './app.po';

describe('nfte-dlo App', () => {
  let page: NfteDloPage;

  beforeEach(() => {
    page = new NfteDloPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
