import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDetalhesTecnico } from './pagina-detalhes-tecnico';

describe('PaginaDetalhesTecnico', () => {
  let component: PaginaDetalhesTecnico;
  let fixture: ComponentFixture<PaginaDetalhesTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDetalhesTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDetalhesTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
