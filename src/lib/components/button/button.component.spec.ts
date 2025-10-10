import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('Button.Component', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
  });

    it('should create', () => {
      const fixture = TestBed.createComponent(ButtonComponent);
      const btn = fixture.componentInstance;
      expect(btn).toBeTruthy();
    });

    it(`Button label is displayed`, () => {
      const fixture = TestBed.createComponent(ButtonComponent);
      const element = fixture.nativeElement;
      element.label = 'Button';
      expect(element.label).toEqual('Button'); 
    });

    it('Button is clicked', () => {
      const fixture = TestBed.createComponent(ButtonComponent);
      const btn = fixture.componentInstance;
      spyOn(btn, 'onClick');

      const button = fixture.debugElement.nativeElement.querySelector('button');
      button.click();
      expect(btn.onClick).toHaveBeenCalled();
    });
     
    it('Button is disabled', () => {
      const fixture = TestBed.createComponent(ButtonComponent);
      const btn = fixture.componentInstance;
      btn.disabled = true;
      fixture.detectChanges();
      const button = fixture.debugElement.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });
});
