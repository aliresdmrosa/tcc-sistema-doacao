import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UsuarioService } from '../core/services/usuario.service';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTooltipModule,
    FlexLayoutModule,
    DatePipe
  ],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css'],
})
export class ConsultaComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<any>([]);
  filtro = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (usuario: any, filtro: string): boolean => {
      const termo = filtro.trim().toLowerCase();
      const texto = [
        usuario.id,
        usuario.grr,
        usuario.nome,
        usuario.cpf,
        usuario.dataCadastro,
        usuario.curso
      ].join(' ').toLowerCase();

      return texto.includes(termo);
    };

    this.carregarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns = [
    'id',
    'grr',
    'nome',
    'cpf',
    'dataCadastro',
    'curso',
    'acoes'
  ];

  carregarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe((usuarios) => {
      this.dataSource.data = usuarios;
    });
  }

  aplicarFiltroPesquisa(): void {
    this.dataSource.filter = this.filtro.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editar(element: any): void {
    console.log('Editar:', element);
  }

  excluir(element: any): void {
    console.log('Excluir:', element);
    this.usuarioService.deletarUsuario(element.id).subscribe({
      next: () => {
        console.log('Usuário excluído com sucesso!');
        this.carregarUsuarios();
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
      }
    });
  }
}
