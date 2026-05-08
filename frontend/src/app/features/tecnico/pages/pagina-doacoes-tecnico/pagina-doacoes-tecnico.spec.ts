import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaDoacoesTecnico } from './pagina-doacoes-tecnico';

describe('PaginaDoacoesTecnico', () => {
  let component: PaginaDoacoesTecnico;
  let fixture: ComponentFixture<PaginaDoacoesTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDoacoesTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaDoacoesTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
