import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaNovaSenha } from './pagina-nova-senha';

describe('PaginaNovaSenha', () => {
  let component: PaginaNovaSenha;
  let fixture: ComponentFixture<PaginaNovaSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaNovaSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaNovaSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
