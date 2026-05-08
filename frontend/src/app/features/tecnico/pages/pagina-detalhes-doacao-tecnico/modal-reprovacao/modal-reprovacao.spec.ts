import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReprovacao } from './modal-reprovacao';

describe('ModalReprovacao', () => {
  let component: ModalReprovacao;
  let fixture: ComponentFixture<ModalReprovacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalReprovacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReprovacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
