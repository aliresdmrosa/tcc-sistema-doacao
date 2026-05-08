import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaHistoricoReparos } from './pagina-historico-reparos';

describe('PaginaHistoricoReparos', () => {
  let component: PaginaHistoricoReparos;
  let fixture: ComponentFixture<PaginaHistoricoReparos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaHistoricoReparos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaHistoricoReparos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
