import { TestBed } from '@angular/core/testing';
import { SampleModalComponent } from '../sample-modal/sample-modal.component';

describe('Sample-Modal.Component', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleModalComponent],
    }).compileComponents();
  });

    it('should create', () => {
      const fixture = TestBed.createComponent(SampleModalComponent);
      const btn = fixture.componentInstance;
      expect(btn).toBeTruthy();
    });
});

