import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaRedefinirSenha } from './pagina-redefinir-senha';

describe('PaginaRedefinirSenha', () => {
  let component: PaginaRedefinirSenha;
  let fixture: ComponentFixture<PaginaRedefinirSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRedefinirSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaRedefinirSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
