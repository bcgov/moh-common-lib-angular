import { TestBed } from '@angular/core/testing';
import { NameComponent } from './name.component';
import { FormsModule } from '@angular/forms';

describe('Name.Component', () => {
 
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NameComponent, FormsModule],
      }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(NameComponent);
        const cmpInstance = fixture.componentInstance;
        expect(cmpInstance).toBeTruthy();
    });
});
