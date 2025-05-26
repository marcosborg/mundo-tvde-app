import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssistenteVirtualPage } from './assistente-virtual.page';

describe('AssistenteVirtualPage', () => {
  let component: AssistenteVirtualPage;
  let fixture: ComponentFixture<AssistenteVirtualPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistenteVirtualPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
