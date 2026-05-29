import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaListarDoacao } from './pagina-listar-doacao';

describe('PaginaListarDoacao', () => {
  let component: PaginaListarDoacao;
  let fixture: ComponentFixture<PaginaListarDoacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaListarDoacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaListarDoacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
