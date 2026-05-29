import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDetalhesDoacaoAdmin } from './pagina-detalhes-doacao-admin';

describe('PaginaDetalhesDoacaoAdmin', () => {
  let component: PaginaDetalhesDoacaoAdmin;
  let fixture: ComponentFixture<PaginaDetalhesDoacaoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDetalhesDoacaoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDetalhesDoacaoAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
