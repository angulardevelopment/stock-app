import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptocurrencyTrackerComponent } from './cryptocurrency-tracker.component';

describe('CryptocurrencyTrackerComponent', () => {
  let component: CryptocurrencyTrackerComponent;
  let fixture: ComponentFixture<CryptocurrencyTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptocurrencyTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptocurrencyTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
