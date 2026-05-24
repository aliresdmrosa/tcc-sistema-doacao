import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBase } from './dialog-base';

describe('DialogBase', () => {
  let component: DialogBase;
  let fixture: ComponentFixture<DialogBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
