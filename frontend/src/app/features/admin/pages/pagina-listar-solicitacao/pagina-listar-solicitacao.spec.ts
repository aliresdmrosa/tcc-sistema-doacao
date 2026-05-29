import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaListarSolicitacao } from './pagina-listar-solicitacao';

describe('PaginaListarSolicitacao', () => {
  let component: PaginaListarSolicitacao;
  let fixture: ComponentFixture<PaginaListarSolicitacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaListarSolicitacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaListarSolicitacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
