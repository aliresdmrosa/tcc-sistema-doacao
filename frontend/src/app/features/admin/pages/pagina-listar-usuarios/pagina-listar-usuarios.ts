import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

@Component({
  selector: 'app-pagina-listar-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './pagina-listar-usuarios.html',
  styleUrl: './pagina-listar-usuarios.css'
})
export class PaginaListarUsuarios implements OnInit, AfterViewInit {
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['id', 'nome', 'cpf', 'email', 'perfil', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>([]);
  carregando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table?: MatTable<Usuario>;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (usuario: Usuario, filtro: string): boolean => {
      const texto = filtro.trim().toLowerCase();

      return (
        (usuario.nome ?? '').toLowerCase().includes(texto) ||
        (usuario.email ?? '').toLowerCase().includes(texto) ||
        (usuario.cpf ?? '').toLowerCase().includes(texto) ||
        (usuario.perfil ?? '').toLowerCase().includes(texto)
      );
    };

    this.carregarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarUsuarios(): void {
    this.carregando = true;

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.dataSource.data = [...usuarios];
        this.carregando = false;
        this.atualizarTabela();
      },
      error: (erro) => {
        console.error('Erro ao listar usuários:', erro);
        this.snackBar.open('Erro ao carregar usuários.', 'Fechar', {
          duration: 3000
        });
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private atualizarTabela(): void {
    queueMicrotask(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      this.table?.renderRows();
      this.cdr.detectChanges();
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.atualizarTabela();
  }

  editarUsuario(usuario: Usuario): void {
    const perfil = this.normalizarPerfil(usuario.perfil);

    if (perfil.includes('TECNICO')) {
      this.router.navigate(['/admin/tecnicos', usuario.id]);
      return;
    }

    this.router.navigate(['/admin/usuarios', usuario.id]);
  }

  private normalizarPerfil(perfil?: string): string {
    return (perfil ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  excluirUsuario(id: number): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir este usuário?',
        mensagem: 'Essa ação será permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.usuarioService.deletarUsuario(id).subscribe({
        next: () => {
          this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.carregarUsuarios();
        },
        error: (erro) => {
          console.error('Erro ao excluir usuário:', erro);
          this.snackBar.open('Erro ao excluir usuário.', 'Fechar', {
            duration: 3000
          });
        }
      });
    });
  }
}
