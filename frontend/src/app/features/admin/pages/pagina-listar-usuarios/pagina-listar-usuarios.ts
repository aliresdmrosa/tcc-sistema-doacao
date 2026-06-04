import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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

  displayedColumns: string[] = ['id', 'nome', 'cpf', 'email', 'grr', 'curso', 'perfil', 'status', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>([]);
  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';
  private timeoutCarregamento?: ReturnType<typeof setTimeout>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table?: MatTable<Usuario>;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (usuario: Usuario, filtro: string): boolean => {
      const texto = filtro.trim().toLowerCase();

      return (
        usuario.id.toString().includes(texto) ||
        (usuario.nome ?? '').toLowerCase().includes(texto) ||
        (usuario.email ?? '').toLowerCase().includes(texto) ||
        (usuario.cpf ?? '').toLowerCase().includes(texto) ||
        (usuario.grr ?? '').toLowerCase().includes(texto) ||
        (usuario.curso ?? '').toLowerCase().includes(texto) ||
        (usuario.perfil ?? '').toLowerCase().includes(texto) ||
        this.textoStatus(usuario).toLowerCase().includes(texto)
      );
    };

    this.carregarUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.erroAoCarregar = false;
    this.iniciarTimeoutCarregamento();

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.limparTimeoutCarregamento();
        this.dataSource.data = [...usuarios];
        this.carregando = false;
        this.erroAoCarregar = false;
        this.atualizarTabela();
      },
      error: (erro) => {
        this.limparTimeoutCarregamento();
        console.error('Erro ao listar usuários:', erro);
        this.carregando = false;
        this.erroAoCarregar = true;
        this.cdr.detectChanges();
      }
    });
  }

  tentarNovamente(): void {
    this.carregarUsuarios();
  }

  private iniciarTimeoutCarregamento(): void {
    this.limparTimeoutCarregamento();

    this.timeoutCarregamento = setTimeout(() => {
      if (!this.carregando) {
        return;
      }

      this.carregando = false;
      this.erroAoCarregar = true;
      this.cdr.detectChanges();
    }, 5000);
  }

  private limparTimeoutCarregamento(): void {
    if (this.timeoutCarregamento) {
      clearTimeout(this.timeoutCarregamento);
      this.timeoutCarregamento = undefined;
    }
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

  aplicarFiltroPesquisa(): void {
    this.dataSource.filter = this.termoPesquisa.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.atualizarTabela();
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
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

  textoStatus(usuario: Usuario): string {
    return usuario.ativo === false ? 'Desativado' : 'Ativo';
  }

  desativarUsuario(usuario: Usuario): void {
    if (usuario.ativo === false) {
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja desativar este perfil?',
        mensagem: 'O usuário não poderá mais acessar a conta, mas seus registros serão preservados.',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.usuarioService.desativarPerfil(usuario.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.map((item) =>
            item.id === usuario.id ? { ...item, ativo: false } : item
          );
          this.aplicarFiltroPesquisa();
          this.snackBar.open('Perfil desativado com sucesso!', 'Fechar', {
            duration: 3000
          });
        },
        error: (erro) => {
          console.error('Erro ao desativar perfil:', erro);
          this.snackBar.open('Erro ao desativar perfil.', 'Fechar', {
            duration: 3000
          });
        }
      });
    });
  }
}
