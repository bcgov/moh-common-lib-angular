import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractReactForm } from './abstract-react-form';

class ConcreteReactForm extends AbstractReactForm {
  constructor(router: Router) {
    super(router);
  }
  continue(): void {}
}

describe('AbstractReactForm', () => {
  let form: ConcreteReactForm;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    form = new ConcreteReactForm(routerSpy);
  });

  it('should create', () => {
    expect(form).toBeTruthy();
  });

  describe('canContinue()', () => {
    it('should return false when formGroup is not set', () => {
      expect(form.canContinue()).toBe(false);
    });

    it('should return false when formGroup is invalid', () => {
      form.formGroup = new FormGroup({
        name: new FormControl('', (v) => (v.value ? null : { required: true })),
      });
      expect(form.canContinue()).toBe(false);
    });

    it('should return true when formGroup is valid', () => {
      form.formGroup = new FormGroup({ name: new FormControl('Alice') });
      expect(form.canContinue()).toBe(true);
    });
  });

  describe('markAllInputsTouched()', () => {
    it('should mark all controls in a single FormGroup as touched', () => {
      const ctrl = new FormControl('');
      form.formGroup = new FormGroup({ field: ctrl });
      (form as any).markAllInputsTouched(form.formGroup);
      expect(ctrl.touched).toBe(true);
    });

    it('should mark controls in each FormGroup when an array is passed', () => {
      const ctrl1 = new FormControl('');
      const ctrl2 = new FormControl('');
      const fg1 = new FormGroup({ a: ctrl1 });
      const fg2 = new FormGroup({ b: ctrl2 });
      (form as any).markAllInputsTouched([fg1, fg2]);
      expect(ctrl1.touched).toBe(true);
      expect(ctrl2.touched).toBe(true);
    });

    it('should fall back to the instance formGroup when null is passed', () => {
      const ctrl = new FormControl('');
      form.formGroup = new FormGroup({ field: ctrl });
      (form as any).markAllInputsTouched(null);
      expect(ctrl.touched).toBe(true);
    });
  });
});
