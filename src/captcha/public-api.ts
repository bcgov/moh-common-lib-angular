/**
 * Public API for moh-common-lib-angular/captcha.
 * This is the secondary entry point, referenced by
 * projects/common-lib/captcha/ng-package.json.
 */
export { CaptchaModule } from './captcha.module';
export { CaptchaComponent, CAPTCHA_STATE } from './captcha.component';
export { CaptchaDataService } from './captcha-data.service';
export type { ServerPayload } from './captcha-data.service';
