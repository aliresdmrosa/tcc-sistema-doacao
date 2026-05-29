import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaSucessoRedefinirSenha } from './pagina-sucesso-redefinir-senha';

describe('PaginaSucessoRedefinirSenha', () => {
  let component: PaginaSucessoRedefinirSenha;
  let fixture: ComponentFixture<PaginaSucessoRedefinirSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaSucessoRedefinirSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaSucessoRedefinirSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
