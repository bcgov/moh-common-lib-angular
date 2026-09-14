/**
 * Public API for moh-common-lib-angular.
 * This is the ng-packagr entry point, referenced by projects/common-lib/ng-package.json.
 * Anything not exported here is not part of the published library surface.
 */

// Models
export { Base } from './lib/models/base';
export { Address } from './lib/models/address.model';
export { Person } from './lib/models/person.model';
export type { SimpleDate } from './lib/models/simple-date.interface';
export { AbstractForm } from './lib/models/abstract-form';
export { AbstractBaseForm } from './lib/models/abstract-base-form';
export { AbstractFormControl } from './lib/models/abstract-form-control';
export { AbstractReactForm } from './lib/models/abstract-react-form';
export { Container } from './lib/models/container';
export type { WizardProgressItem } from './lib/models/container';
export type { ErrorMessage } from './lib/models/error-message.interface';
export {
  CommonImage,
  CommonImageError,
  CommonImageProcessingError,
  CommonImageScaleFactorsImpl,
} from './lib/models/images.model';
export { LETTER, NUMBER, SPACE } from './lib/models/mask.constants';

// Services
export { AbstractHttpService } from './lib/services/abstract-api-service';
export { GeocoderService } from './lib/services/geocoder.service';
export type { GeoAddressResult } from './lib/services/geocoder.service';
export { AbstractPageGuardService } from './lib/services/abstract-page-guard.service';
export {
  DefaultPageGuardService,
  BYPASS_GUARDS,
  START_PAGE_URL,
} from './lib/services/default-page-guard.service';
export { LoadPageGuardService } from './lib/services/load-page-guard.service';
export { PageStateService } from './lib/services/page-state.service';
export { ContainerService } from './lib/services/container.service';
export { AbstractPgCheckService } from './lib/services/abstract-pg-check.service';
export { CheckCompleteBaseService } from './lib/services/check-complete-base.service';
export { RouteGuardService } from './lib/services/route-guard.service';
export { CommonLogger, CommonLogEvents } from './lib/services/logger.service';

// Components
export { AddressComponent } from './lib/components/address/address.component';
export { AddressValidatorComponent } from './lib/components/address-validator/address-validator.component';
export { AccordionCommonComponent } from './lib/components/accordion/accordion.component';
export { ButtonComponent } from './lib/components/button/button.component';
export { CheckboxComponent } from './lib/components/checkbox/checkbox.component';
export { CityComponent } from './lib/components/city/city.component';
export {
  ConfirmTemplateComponent,
  ApiStatusCodes,
} from './lib/components/confirm-template/confirm-template.component';
export { ConsentModalComponent } from './lib/components/consent-modal/consent-modal.component';
export { CoreBreadcrumbComponent } from './lib/components/core-breadcrumb/core-breadcrumb.component';
export { CountryComponent } from './lib/components/country/country.component';
export { EmailComponent } from './lib/components/email/email.component';
export { ErrorContainerComponent } from './lib/components/error-container/error-container.component';
export { FormActionBarComponent } from './lib/components/form-action-bar/form-action-bar.component';
export { FileUploaderComponent } from './lib/components/file-uploader/file-uploader.component';
export type { FileUploaderMsg } from './lib/components/file-uploader/file-uploader.component';
export { PdfService } from './lib/components/file-uploader/pdf.service';
export { FullNameComponent } from './lib/components/full-name/full-name.component';
export { HeaderComponent } from './lib/components/header/header.component';
export { NameComponent } from './lib/components/name/name.component';
export { PageFrameworkComponent } from './lib/components/page-framework/page-framework.component';
export { PageSectionComponent } from './lib/components/page-section/page-section.component';
// PasswordComponent uses zxcvbn, which not every consuming app carries. Leaving it
// unexported keeps it out of the published package entirely, since ng-packagr only
// compiles what this barrel reaches. To ship it, export it here and add zxcvbn to the
// peerDependencies in projects/common-lib/package.json.
// export { PasswordComponent } from './lib/components/password/password.component';
export { PostalCodeComponent } from './lib/components/postal-code/postal-code.component';
export { PhnComponent } from './lib/components/phn/phn.component';
export { PhoneNumberComponent } from './lib/components/phone-number/phone-number.component';
export { ProvinceComponent } from './lib/components/province/province.component';
export { RadioComponent } from './lib/components/radio/radio.component';
export { SampleModalComponent } from './lib/components/sample-modal/sample-modal.component';
export { WizardProgressBarComponent } from './lib/components/wizard-progress-bar/wizard-progress-bar.component';
export { SinComponent } from './lib/components/sin/sin.component';
export { StreetComponent } from './lib/components/street/street.component';
export { ThumbnailComponent } from './lib/components/thumbnail/thumbnail.component';

// Validators
export {
  commonValidateCity,
  ValidateCityDirective,
} from './lib/components/city/validate-city.directive';
export {
  commonValidateName,
  ValidateNameDirective,
} from './lib/components/name/validate-name.directive';
export {
  commonValidateStreet,
  ValidateStreetDirective,
} from './lib/components/street/validate-street.directive';
export {
  commonDuplicateCheck,
  DuplicateCheckDirective,
} from './lib/components/duplicate-check/duplicate-check.directive';
export {
  commonValidatePostalcode,
  ValidatePostalcodeDirective,
} from './lib/components/postal-code/validate-postalcode.directive';
export {
  commonValidateBcPostal,
  ValidateBcPostalDirective,
} from './lib/components/postal-code/validate-bc-postal.directive';
export {
  commonValidateRegion,
  ValidateRegionDirective,
} from './lib/components/validate-region/validate-region.directive';

// Helpers
export { deburr } from './helpers/deburr';
export { scrollTo, scrollToError } from './helpers/scroll-helpers';
export { MoHCommonLibraryError } from './helpers/library-error';

// SharedCoreModule — compatibility shim for apps that used moh-common-lib's NgModule.
// The new library uses standalone components. Import individual components directly.
// TODO: Replace SharedCoreModule usage with individual standalone component imports.
import { NgModule } from '@angular/core';
@NgModule({})
export class SharedCoreModule {}
