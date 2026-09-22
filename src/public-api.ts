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
export { Container, type WizardProgressItem } from './lib/models/container';
export {
  LabelReplacementTag,
  RequiredMsg,
  InvalidMsg,
  DuplicateMsg,
  RegionCharsMsg,
  replaceLabelTag,
  type ErrorMessage,
} from './lib/models/error-message.interface';
export {
  CommonImage,
  CommonImageError,
  CommonImageProcessingError,
  CommonImageScaleFactorsImpl,
  type CommonImageScaleFactors,
  type CommonAttachmentJson,
} from './lib/models/images.model';
export { LETTER, NUMBER, SPACE } from './lib/models/mask.constants';

// Services
export { AbstractHttpService } from './lib/services/abstract-api-service';
export {
  GeocoderService,
  type GeoAddressResult,
} from './lib/services/geocoder.service';
export { AbstractPageGuardService } from './lib/services/abstract-page-guard.service';
export {
  DefaultPageGuardService,
  BYPASS_GUARDS,
  START_PAGE_URL,
} from './lib/services/default-page-guard.service';
export { LoadPageGuardService } from './lib/services/load-page-guard.service';
export {
  PageStateService,
  type PageList,
} from './lib/services/page-state.service';
export { ContainerService } from './lib/services/container.service';
export { AbstractPgCheckService } from './lib/services/abstract-pg-check.service';
export {
  CheckCompleteBaseService,
  type PageListInterface,
} from './lib/services/check-complete-base.service';
export { RouteGuardService } from './lib/services/route-guard.service';
export {
  CommonLogger,
  CommonLogEvents,
  type CommonLogMessage,
} from './lib/services/logger.service';

// Components
export {
  AddressComponent,
  type AddrLabelList,
  type Maxlengths,
  type ReadOnlyFields,
} from './lib/components/address/address.component';
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
export {
  CountryComponent,
  COUNTRY_LIST,
  CANADA,
  getCountryDescription,
  type CountryList,
} from './lib/components/country/country.component';
export { DateComponent } from './lib/components/date/date.component';
export { DropdownComponent } from './lib/components/dropdown/dropdown.component';
export { DateFieldFormatDirective } from './lib/components/date/date-field-format.directive';
export { EmailComponent } from './lib/components/email/email.component';
export { ErrorContainerComponent } from './lib/components/error-container/error-container.component';
export { FormActionBarComponent } from './lib/components/form-action-bar/form-action-bar.component';
export {
  FileUploaderComponent,
  type FileUploaderMsg,
} from './lib/components/file-uploader/file-uploader.component';
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
export {
  ProvinceComponent,
  PROVINCE_LIST,
  BRITISH_COLUMBIA,
  getProvinceDescription,
  type ProvinceList,
} from './lib/components/province/province.component';
export {
  RadioComponent,
  type IRadioItems,
} from './lib/components/radio/radio.component';
export {
  SampleModalComponent,
  type SampleImageInterface,
} from './lib/components/sample-modal/sample-modal.component';
export { WizardProgressBarComponent } from './lib/components/wizard-progress-bar/wizard-progress-bar.component';
export { SinComponent } from './lib/components/sin/sin.component';
export { StreetComponent } from './lib/components/street/street.component';
export { ThumbnailComponent } from './lib/components/thumbnail/thumbnail.component';
export { XiconButtonComponent } from './lib/components/xicon-button/xicon-button.component';

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

// SharedCoreModule - convenience NgModule for apps that declare non-standalone
// components in an NgModule and need `common-*` tags available in those templates.
// It imports and re-exports every standalone component and validator directive this
// entry point exports (PasswordComponent excepted, since it is not exported above).
// Prefer importing the individual standalone components/directives directly in new
// code; reach for this module only where the consuming component's own module is
// still NgModule-based and pulling in one import per tag is not worth it.
import { NgModule } from '@angular/core';
import { AddressComponent } from './lib/components/address/address.component';
import { AddressValidatorComponent } from './lib/components/address-validator/address-validator.component';
import { AccordionCommonComponent } from './lib/components/accordion/accordion.component';
import { ButtonComponent } from './lib/components/button/button.component';
import { CheckboxComponent } from './lib/components/checkbox/checkbox.component';
import { CityComponent } from './lib/components/city/city.component';
import { ConfirmTemplateComponent } from './lib/components/confirm-template/confirm-template.component';
import { ConsentModalComponent } from './lib/components/consent-modal/consent-modal.component';
import { CoreBreadcrumbComponent } from './lib/components/core-breadcrumb/core-breadcrumb.component';
import { CountryComponent } from './lib/components/country/country.component';
import { DateComponent } from './lib/components/date/date.component';
import { DateFieldFormatDirective } from './lib/components/date/date-field-format.directive';
import { DropdownComponent } from './lib/components/dropdown/dropdown.component';
import { EmailComponent } from './lib/components/email/email.component';
import { ErrorContainerComponent } from './lib/components/error-container/error-container.component';
import { FormActionBarComponent } from './lib/components/form-action-bar/form-action-bar.component';
import { FileUploaderComponent } from './lib/components/file-uploader/file-uploader.component';
import { FullNameComponent } from './lib/components/full-name/full-name.component';
import { HeaderComponent } from './lib/components/header/header.component';
import { NameComponent } from './lib/components/name/name.component';
import { PageFrameworkComponent } from './lib/components/page-framework/page-framework.component';
import { PageSectionComponent } from './lib/components/page-section/page-section.component';
import { PostalCodeComponent } from './lib/components/postal-code/postal-code.component';
import { PhnComponent } from './lib/components/phn/phn.component';
import { PhoneNumberComponent } from './lib/components/phone-number/phone-number.component';
import { ProvinceComponent } from './lib/components/province/province.component';
import { RadioComponent } from './lib/components/radio/radio.component';
import { SampleModalComponent } from './lib/components/sample-modal/sample-modal.component';
import { WizardProgressBarComponent } from './lib/components/wizard-progress-bar/wizard-progress-bar.component';
import { SinComponent } from './lib/components/sin/sin.component';
import { StreetComponent } from './lib/components/street/street.component';
import { ThumbnailComponent } from './lib/components/thumbnail/thumbnail.component';
import { XiconButtonComponent } from './lib/components/xicon-button/xicon-button.component';
import { ValidateCityDirective } from './lib/components/city/validate-city.directive';
import { ValidateNameDirective } from './lib/components/name/validate-name.directive';
import { ValidateStreetDirective } from './lib/components/street/validate-street.directive';
import { DuplicateCheckDirective } from './lib/components/duplicate-check/duplicate-check.directive';
import { ValidatePostalcodeDirective } from './lib/components/postal-code/validate-postalcode.directive';
import { ValidateBcPostalDirective } from './lib/components/postal-code/validate-bc-postal.directive';
import { ValidateRegionDirective } from './lib/components/validate-region/validate-region.directive';

const SHARED_CORE_IMPORTS = [
  AddressComponent,
  AddressValidatorComponent,
  AccordionCommonComponent,
  ButtonComponent,
  CheckboxComponent,
  CityComponent,
  ConfirmTemplateComponent,
  ConsentModalComponent,
  CoreBreadcrumbComponent,
  CountryComponent,
  DateComponent,
  DateFieldFormatDirective,
  DropdownComponent,
  EmailComponent,
  ErrorContainerComponent,
  FormActionBarComponent,
  FileUploaderComponent,
  FullNameComponent,
  HeaderComponent,
  NameComponent,
  PageFrameworkComponent,
  PageSectionComponent,
  PostalCodeComponent,
  PhnComponent,
  PhoneNumberComponent,
  ProvinceComponent,
  RadioComponent,
  SampleModalComponent,
  WizardProgressBarComponent,
  SinComponent,
  StreetComponent,
  ThumbnailComponent,
  XiconButtonComponent,
  ValidateCityDirective,
  ValidateNameDirective,
  ValidateStreetDirective,
  DuplicateCheckDirective,
  ValidatePostalcodeDirective,
  ValidateBcPostalDirective,
  ValidateRegionDirective,
];

@NgModule({
  imports: SHARED_CORE_IMPORTS,
  exports: SHARED_CORE_IMPORTS,
})
export class SharedCoreModule {}
