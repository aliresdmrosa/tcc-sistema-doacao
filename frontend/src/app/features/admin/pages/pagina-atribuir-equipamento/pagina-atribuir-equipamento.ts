import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

interface EquipamentoDisponivel {
  id: string;
  nome: string;
  descricao: string;
  estado: string;
  tipo: string;
  imagem: string;
}

@Component({
  selector: 'app-pagina-atribuir-equipamento',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './pagina-atribuir-equipamento.html',
  styleUrls: ['./pagina-atribuir-equipamento.css']
})
export class PaginaAtribuirEquipamentoComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  estadoSelecionado = 'USADO';
  tipoSelecionado = 'COMPUTADOR';

  equipamentos: EquipamentoDisponivel[] = [
    {
      id: '001',
      nome: 'Computador HP',
      descricao: 'Computador completo em bom estado',
      estado: 'USADO',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '002',
      nome: 'Computador HP',
      descricao: 'Computador completo em bom estado',
      estado: 'USADO',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100'
    }
  ];

  ngAfterViewInit(): void {
  }

  selecionarEquipamento(equipamento: EquipamentoDisponivel): void {
    console.log('Equipamento selecionado:', equipamento);

    // chamada api
  }

  voltar(): void {
    history.back();
  }
}
