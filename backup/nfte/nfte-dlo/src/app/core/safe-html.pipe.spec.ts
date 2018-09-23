import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipePipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe();
    expect(pipe).toBeTruthy();
  });
});
