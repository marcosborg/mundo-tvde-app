import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandCarsPage } from './stand-cars.page';

describe('StandCarsPage', () => {
  let component: StandCarsPage;
  let fixture: ComponentFixture<StandCarsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StandCarsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
