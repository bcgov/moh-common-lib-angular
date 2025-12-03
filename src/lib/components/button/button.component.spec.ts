import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';


function createButtonComponent() {
  const fixture = TestBed.createComponent(ButtonComponent);
  const component = fixture.componentInstance;
  const element = fixture.nativeElement;
  const btnQuerySelector = fixture.debugElement.nativeElement.querySelector('button');

  return { fixture, component, element, btnQuerySelector };
}

// Test Suite for Button Component
describe('Button.Component', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
  });

    // Test for component creation
    it('Should create', () => {
      const { component } = createButtonComponent();
      expect(component).toBeTruthy();
    });

    // Test for button label input
     it(`Button label is displayed`, () => {
      const { element } = createButtonComponent();
      element.label = 'Button';
      expect(element.label).toEqual('Button'); 
    });


    // Test for button click event
    it('Button is clicked', () => {
      const { component, btnQuerySelector } = createButtonComponent();
      spyOn(component, 'onClick');

      btnQuerySelector.click();
      expect(component.onClick).toHaveBeenCalled();
    });

    // Test for button disabled state
    it('Button is disabled', () => {
     const {fixture, component, btnQuerySelector } = createButtonComponent();
      component.disabled = true;
      fixture.detectChanges();   
      expect(btnQuerySelector.disabled).toBe(true);
    });

});
