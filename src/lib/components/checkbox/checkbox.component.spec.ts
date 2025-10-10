import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

describe('Checkbox.Component', () => {
 
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CheckboxComponent, FormsModule],
      }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(CheckboxComponent);
        const checkBox = fixture.componentInstance;
        expect(checkBox).toBeTruthy();
    });

     it(`Checkbox label is displayed`, () => {
          const fixture = TestBed.createComponent(CheckboxComponent);
          const element = fixture.nativeElement;
          element.label = 'Checkbox';
          expect(element.label).toEqual('Checkbox'); 
     });

    it('Checkbox is checked', () => {
       
        const fixture = TestBed.createComponent(CheckboxComponent);
        const checkBox = fixture.componentInstance;
        const el = fixture.nativeElement;
        checkBox.data = true;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
       
          expect(el.querySelector('input[type=checkbox]').checked).toEqual(true);
        });
    });
});
