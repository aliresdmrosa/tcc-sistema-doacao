import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { CURSOS, apenasNumeros, formatarCpf, normalizarGrr } from '../../../../shared/utils/form-validations';

interface DoacaoResumo {
  id: number;
  equipamento: string;
  status: string;
  data: string;
}

interface SolicitacaoResumo {
  id: number;
  equipamento: string;
  status: string;
  data: string;
}

interface UsuarioDetalhes {
  id: number;
  email: string;
  nome: string;
  cpf: string;
  grr: string;
  curso: string;
  dataCadastro: string;
  doacoes: DoacaoResumo[];
  solicitacoes: SolicitacaoResumo[];
}

@Component({
  selector: 'app-pagina-detalhes-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './pagina-detalhes-usuario.html',
  styleUrls: ['./pagina-detalhes-usuario.css']
})
export class PaginaDetalhesUsuario implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  idUsuario = Number(this.route.snapshot.paramMap.get('id'));

  modoEdicao = false;
  carregando = false;
  cursos = CURSOS;

  usuario: UsuarioDetalhes = {
    id: 1,
    email: 'vitoria@email.com',
    nome: 'Vitória Laís Souza',
    cpf: '11100110000',
    grr: '--',
    curso: '--',
    dataCadastro: '09/07/2025',
    doacoes: [
      {
        id: 1,
        equipamento: 'Computador',
        status: 'PENDENTE',
        data: '01/05/2025'
      },
      {
        id: 2,
        equipamento: 'Notebook',
        status: 'APROVADA',
        data: '03/05/2025'
      }
    ],
    solicitacoes: [
      {
        id: 1,
        equipamento: 'Notebook',
        status: 'EM ANÁLISE',
        data: '05/05/2025'
      }
    ]
  };

  usuarioForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]],
    grr: ['', [Validators.pattern(/^\d{8}$/)]],
    curso: ['']
  });

  ngOnInit(): void {
    this.carregarDadosMock();

    // chamada api
    // this.buscarUsuarioDaApi();
  }

  carregarDadosMock(): void {
    console.log('Carregando usuário mock:', this.idUsuario);

    this.preencherFormulario();
    this.usuarioForm.disable();
  }

  buscarUsuarioDaApi(): void {
    // chamada api para buscar usuário por id
  }

  preencherFormulario(): void {
    this.usuarioForm.patchValue({
      nome: this.usuario.nome,
      cpf: formatarCpf(this.usuario.cpf),
      email: this.usuario.email,
      grr: this.usuario.grr,
      curso: this.usuario.curso
    });
  }

  voltar(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  ativarEdicao(): void {
    this.modoEdicao = true;
    this.usuarioForm.enable();
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    this.preencherFormulario();
    this.usuarioForm.disable();
  }

  salvar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dadosAtualizados = {
      nome: this.usuarioForm.value.nome ?? '',
      cpf: apenasNumeros(this.usuarioForm.value.cpf),
      email: this.usuarioForm.value.email ?? '',
      grr: this.usuarioForm.value.grr ?? '',
      curso: this.usuarioForm.value.curso ?? ''
    };

    // mock
    this.usuario = {
      ...this.usuario,
      ...dadosAtualizados
    };

    console.log('Usuário atualizado:', this.usuario);

    this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', {
      duration: 3000
    });

    this.carregando = false;
    this.modoEdicao = false;
    this.usuarioForm.disable();

    // chamada api
    // this.usuarioService.atualizarUsuario(this.usuario.id, dadosAtualizados).subscribe(...)
  }

deletar(): void {
  const dialogRef = this.dialog.open(DialogBaseComponent, {
    width: '420px',
    disableClose: true,
    data: {
      tipo: 'confirm',
      titulo: 'Deseja excluir este perfil?',
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

    console.log('Deletar usuário:', this.usuario.id);

    // chamada api para deletar usuário

    this.snackBar.open('Perfil excluído com sucesso!', 'Fechar', {
      duration: 3000
    });

    this.router.navigate(['/admin/usuarios']);
  });
}

  abrirDoacao(id: number): void {
    this.router.navigate(['/admin/doacoes', id], {
      queryParams: {
        voltarPara: `/admin/usuarios/${this.idUsuario}`
      }
    });
  }

  abrirSolicitacao(id: number): void {
    this.router.navigate(['/admin/solicitacoes', id], {
      queryParams: {
        voltarPara: `/admin/usuarios/${this.idUsuario}`
      }
    });
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.usuarioForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  aplicarMascaraCpf(): void {
    const campo = this.usuarioForm.get('cpf');
    campo?.setValue(formatarCpf(campo.value), { emitEvent: false });
  }

  aplicarMascaraGrr(): void {
    const campo = this.usuarioForm.get('grr');
    campo?.setValue(normalizarGrr(campo.value), { emitEvent: false });
  }
}
