import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDetalhesUsuario } from './pagina-detalhes-usuario';

describe('PaginaDetalhesUsuario', () => {
  let component: PaginaDetalhesUsuario;
  let fixture: ComponentFixture<PaginaDetalhesUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDetalhesUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDetalhesUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
