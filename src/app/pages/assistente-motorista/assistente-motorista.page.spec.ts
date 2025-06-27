import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssistenteMotoristaPage } from './assistente-motorista.page';

describe('AssistenteMotoristaPage', () => {
  let component: AssistenteMotoristaPage;
  let fixture: ComponentFixture<AssistenteMotoristaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistenteMotoristaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
