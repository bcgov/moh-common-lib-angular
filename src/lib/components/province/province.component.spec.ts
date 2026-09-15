// TODO: code refactor
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
} from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Component,
  ViewChildren,
  QueryList,
  OnInit,
  Type,
} from '@angular/core';
import {
  createTestingModule,
  tickAndDetectChanges,
  getDebugLabel,
  getDebugElement,
} from '../../../helpers/test-helpers';
import { BrowserModule, By } from '@angular/platform-browser';
import { ProvinceComponent, ProvinceList } from './province.component';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { CANADA } from '../country/country.component';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  template: '',
})
class ProvinceTestComponent {
  @ViewChildren(ProvinceComponent)
  provinceComponent!: QueryList<ProvinceComponent>;

  province1!: string;
  province2!: string;

  defaultLabel: string = 'Province';

  provinceList: ProvinceList[] = [
    { provinceCode: 'AB', description: 'Alberta', country: CANADA },
    { provinceCode: 'BC', description: 'British Columbia', country: CANADA },
    { provinceCode: 'MB', description: 'Manitoba', country: CANADA },
  ];
}

@Component({
  template: '',
  imports: [
    ProvinceComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent,
  ],
})
class ProvinceReactTestComponent
  extends ProvinceTestComponent
  implements OnInit
{
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      province1: [this.province1],
      province2: [this.province2],
    });
  }
}

@Component({
  template: '',
  imports: [ProvinceComponent, FormsModule],
})
class ProvinceNgModelTestComponent extends ProvinceTestComponent {}

/**
 * Drives ng-select through its real UI: opens the dropdown and clicks the
 * rendered .ng-option whose label matches, the same path a user takes. This
 * exercises the component's real (ngModelChange)="onValueChange($event)"
 * binding instead of calling onValueChange() directly.
 */
function selectProvinceOptionThroughUi(
  fixture: ComponentFixture<any>,
  provinceDe: any,
  optionLabel: string
): void {
  const ngSelectDe = provinceDe.query(By.directive(NgSelectComponent));
  const ngSelectCmp = ngSelectDe.componentInstance as NgSelectComponent;
  ngSelectCmp.open();
  tickAndDetectChanges(fixture);

  const optionEls: HTMLElement[] = Array.from(
    fixture.nativeElement.querySelectorAll('.ng-option')
  );
  const optionEl = optionEls.find(
    (el) => el.textContent?.trim() === optionLabel
  );
  if (!optionEl) {
    throw new Error(
      `ng-option "${optionLabel}" not found in rendered dropdown`
    );
  }
  optionEl.click();
  tickAndDetectChanges(fixture);
}

describe('Province.Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ErrorContainerComponent],
    }).compileComponents();
  });

  it('should create', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceReactTestComponent,
      `<form [formGroup]="form">
          <common-province 
            name='province1' 
            formControlName='province1'>
          </common-province>
      </form>`
    );

    const component = fixture.componentInstance;
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-province', 'province1');
    const label = getDebugLabel(de, de.componentInstance.labelforId);

    expect(component.provinceComponent).toBeTruthy();
    expect(label).toBe(component.defaultLabel);
    const province1Control = component.form.get('province1');
    expect(
      province1Control && province1Control.hasError('required')
    ).toBeFalsy();
  }));

  it('should select / display province code', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceReactTestComponent,
      `<form [formGroup]="form">
          <common-province
             name='province1' 
             formControlName='province1'
             [provinceList]="provinceList">
          </common-province>
      </form>`
    );

    const provinceCode = 'BC';
    const component = fixture.componentInstance;
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-province', 'province1');

    expect(de).toBeTruthy();

    const province1Control = component.form.get('province1');
    if (province1Control) {
      province1Control.setValue(provinceCode);
      province1Control.setValue(provinceCode);
    }

    tickAndDetectChanges(fixture);

    // Assert the value reached the COMPONENT through writeValue, not that the
    // control we just set still holds what we set. The previous version
    // compared the host's own fixture array to itself and passed even with
    // writeValue gutted.
    expect(de.componentInstance.province).toBe(provinceCode);
  }));

  it('should not write an undefined value over the current province', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceReactTestComponent,
      `<form [formGroup]="form">
          <common-province
             name='province1'
             formControlName='province1'
             [provinceList]="provinceList">
          </common-province>
      </form>`
    );
    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-province', 'province1');

    de.componentInstance.writeValue('BC');
    de.componentInstance.writeValue(undefined);

    expect(de.componentInstance.province).toBe('BC');
  }));

  // ng-select's (ngModelChange) passes onValueChange() the selected
  // provinceCode string, not a DOM Event. Selecting through the real dropdown
  // must update the model, leave the required form valid, and log no error.
  it('should select a province through the ng-select UI and satisfy a template-driven required ngModel', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceNgModelTestComponent,
      `<form>
          <common-province
             name='province1'
             [(ngModel)]="province1"
             required
             [provinceList]="provinceList">
          </common-province>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const de = getDebugElement(fixture, 'common-province', 'province1');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    selectProvinceOptionThroughUi(fixture, de, 'British Columbia');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.province1).toBe('BC');
    expect(de.componentInstance.controlDir.valid).toBe(true);
  }));

  it('should select a province through the ng-select UI and satisfy a reactive required FormControl', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceReactTestComponent,
      `<form [formGroup]="form">
          <common-province
             name='province1'
             formControlName='province1'
             [provinceList]="provinceList">
          </common-province>
      </form>`
    );

    const component = fixture.componentInstance;
    const province1Control = component.form.get('province1');
    province1Control?.setValidators(Validators.required);
    province1Control?.updateValueAndValidity();
    tickAndDetectChanges(fixture);

    const de = getDebugElement(fixture, 'common-province', 'province1');

    selectProvinceOptionThroughUi(fixture, de, 'British Columbia');

    expect(province1Control?.value).toBe('BC');
    expect(province1Control?.valid).toBe(true);
  }));

  // The clear button on an optional province makes ng-select emit null.
  it('should clear an optional province through ng-select without throwing', fakeAsync(() => {
    const fixture = createTestingModule(
      ProvinceReactTestComponent,
      `<form [formGroup]="form">
          <common-province
             name='province1'
             formControlName='province1'
             [provinceList]="provinceList">
          </common-province>
      </form>`
    );

    tickAndDetectChanges(fixture);
    const province1Control = fixture.componentInstance.form.get('province1');
    const de = getDebugElement(fixture, 'common-province', 'province1');
    selectProvinceOptionThroughUi(fixture, de, 'British Columbia');

    const ngSelectCmp = de.query(By.directive(NgSelectComponent))
      .componentInstance as NgSelectComponent;
    ngSelectCmp.clearModel();
    tickAndDetectChanges(fixture);

    expect(province1Control?.value).toBeNull();
  }));
});
