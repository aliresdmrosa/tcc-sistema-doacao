import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarAlunoTecnico } from './modal-cadastrar-aluno-tecnico';

describe('ModalCadastrarAlunoTecnico', () => {
  let component: ModalCadastrarAlunoTecnico;
  let fixture: ComponentFixture<ModalCadastrarAlunoTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCadastrarAlunoTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarAlunoTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
