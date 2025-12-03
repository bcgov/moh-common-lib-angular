import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
 import { HeaderComponent } from './header.component';

describe('Header.Component', () => {
    
  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderComponent, FormsModule],
      }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(HeaderComponent);
        const cmpInstance = fixture.componentInstance;
        expect(cmpInstance).toBeTruthy();
    });
});
