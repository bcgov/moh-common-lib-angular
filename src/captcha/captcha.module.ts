import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CaptchaComponent } from './captcha.component';
import { CaptchaDataService } from './captcha-data.service';

/**
 * Compatibility module for apps migrating from moh-common-lib/captcha.
 *
 * CaptchaComponent is standalone, so it can be imported directly. This module
 * stays because the consuming apps add it to an NgModule's imports, and it
 * carries the CaptchaDataService provider the component needs.
 */
@NgModule({
  imports: [HttpClientModule, CommonModule, FormsModule, CaptchaComponent],
  providers: [CaptchaDataService],
  exports: [CaptchaComponent],
})
export class CaptchaModule {
  static forRoot(): ModuleWithProviders<CaptchaModule> {
    return {
      ngModule: CaptchaModule,
      providers: [CaptchaDataService],
    };
  }
}
