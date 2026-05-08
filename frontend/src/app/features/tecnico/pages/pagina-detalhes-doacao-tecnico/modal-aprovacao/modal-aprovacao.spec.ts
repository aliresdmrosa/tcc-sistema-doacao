import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAprovacao } from './modal-aprovacao';

describe('ModalAprovacao', () => {
  let component: ModalAprovacao;
  let fixture: ComponentFixture<ModalAprovacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAprovacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAprovacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
