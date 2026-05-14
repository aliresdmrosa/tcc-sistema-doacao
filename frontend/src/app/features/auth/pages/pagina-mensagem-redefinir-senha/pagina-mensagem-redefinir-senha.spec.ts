import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaMensagemRedefinirSenha } from './pagina-mensagem-redefinir-senha';

describe('PaginaMensagemRedefinirSenha', () => {
  let component: PaginaMensagemRedefinirSenha;
  let fixture: ComponentFixture<PaginaMensagemRedefinirSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaMensagemRedefinirSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaMensagemRedefinirSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
