import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaReparoDoacao } from './pagina-reparo-doacao';

describe('PaginaReparoDoacao', () => {
  let component: PaginaReparoDoacao;
  let fixture: ComponentFixture<PaginaReparoDoacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaReparoDoacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaReparoDoacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
