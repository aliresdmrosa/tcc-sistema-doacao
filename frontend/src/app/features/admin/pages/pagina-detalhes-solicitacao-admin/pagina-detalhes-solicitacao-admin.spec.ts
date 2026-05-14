import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDetalhesSolicitacaoAdmin } from './pagina-detalhes-solicitacao-admin';

describe('PaginaDetalhesSolicitacaoAdmin', () => {
  let component: PaginaDetalhesSolicitacaoAdmin;
  let fixture: ComponentFixture<PaginaDetalhesSolicitacaoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDetalhesSolicitacaoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDetalhesSolicitacaoAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
