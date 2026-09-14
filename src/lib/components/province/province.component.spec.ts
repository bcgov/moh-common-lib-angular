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
import { BrowserModule } from '@angular/platform-browser';
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
});
