import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  /**
   * constructor
   * @param  {DomSanitizer} privatesanitized
   */
  constructor(private sanitized: DomSanitizer) { }

  /**
   * bypass value to be valid html
   * @param  {} value
   */
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

}

