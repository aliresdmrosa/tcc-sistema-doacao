import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogBaseComponent } from './dialog-base';

describe('DialogBaseComponent', () => {
  let component: DialogBaseComponent;
  let fixture: ComponentFixture<DialogBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBaseComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            titulo: 'Titulo',
            mensagem: 'Mensagem'
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
