import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDetalhesDoacaoTecnico } from './pagina-detalhes-doacao-tecnico';

describe('PaginaDetalhesDoacaoTecnico', () => {
  let component: PaginaDetalhesDoacaoTecnico;
  let fixture: ComponentFixture<PaginaDetalhesDoacaoTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDetalhesDoacaoTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDetalhesDoacaoTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
