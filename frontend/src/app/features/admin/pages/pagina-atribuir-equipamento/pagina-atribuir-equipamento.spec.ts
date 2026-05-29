import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaAtribuirEquipamento } from './pagina-atribuir-equipamento';

describe('PaginaAtribuirEquipamento', () => {
  let component: PaginaAtribuirEquipamento;
  let fixture: ComponentFixture<PaginaAtribuirEquipamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaAtribuirEquipamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaAtribuirEquipamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
