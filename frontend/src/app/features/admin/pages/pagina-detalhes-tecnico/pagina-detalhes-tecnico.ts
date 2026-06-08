import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ReparoService } from '../../../../core/services/reparo.service';
import { CURSOS, apenasNumeros, formatarCpf, normalizarGrr } from '../../../../shared/utils/form-validations';

interface ReparoResumo {
  id: number;
  doacaoId: number;
  equipamento: string;
  status: string;
  data: string;
}

interface TecnicoDetalhes {
  id: number;
  email: string;
  nome: string;
  cpf: string;
  grr: string;
  curso: string;
  dataCadastro: string;
  ativo: boolean;
  reparosConcluidos: ReparoResumo[];
  reparosEmAndamento: ReparoResumo[];
}

@Component({
  selector: 'app-pagina-detalhes-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-detalhes-tecnico.html',
  styleUrls: ['./pagina-detalhes-tecnico.css']
})
export class PaginaDetalhesTecnico implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private usuarioService = inject(UsuarioService);
  private reparoService = inject(ReparoService);

  idTecnico = Number(this.route.snapshot.paramMap.get('id'));

  modoEdicao = false;
  carregando = false;
  acaoPerfilEmAndamento = false;
  cursos = CURSOS;

  tecnico: TecnicoDetalhes = {
    id: 1,
    email: 'vitoria@email.com',
    nome: 'Vitória Laís Souza',
    cpf: '11100110000',
    grr: '--',
    curso: '--',
    dataCadastro: '09/07/2025',
    ativo: true,
    reparosConcluidos: [
      {
        id: 1,
        doacaoId: 1,
        equipamento: 'Notebook',
        status: 'FINALIZADO',
        data: '01/05/2025'
      }
    ],
    reparosEmAndamento: [
      {
        id: 2,
        doacaoId: 2,
        equipamento: 'Computador',
        status: 'EM ANDAMENTO',
        data: '03/05/2025'
      }
    ]
  };

  tecnicoForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    grr: ['', [Validators.pattern(/^\d{8}$/)]],
    curso: ['']
  });

  ngOnInit(): void {
    this.carregarDadosMock();
    this.buscarTecnicoDaApi();
    this.buscarReparosDoTecnico();
  }

  carregarDadosMock(): void {
    console.log('Carregando técnico mock:', this.idTecnico);

    this.preencherFormulario();
    this.tecnicoForm.disable();
  }

  buscarTecnicoDaApi(): void {
    this.usuarioService.buscarPorId(this.idTecnico).subscribe({
      next: (tecnico) => {
        this.tecnico = {
          ...this.tecnico,
          id: tecnico.id,
          nome: tecnico.nome,
          cpf: tecnico.cpf,
          email: tecnico.email,
          dataCadastro: tecnico.dataCadastro ?? this.tecnico.dataCadastro,
          ativo: tecnico.ativo ?? this.tecnico.ativo,
          grr: tecnico.grr ?? this.tecnico.grr,
          curso: tecnico.curso ?? this.tecnico.curso
        };
        this.preencherFormulario();
        this.tecnicoForm.disable();
      },
      error: (erro) => {
        console.error('Erro ao buscar técnico:', erro);
      }
    });
  }

  buscarReparosDoTecnico(): void {
    this.reparoService.listarReparoTecnicoPorId(this.idTecnico).subscribe({
      next: (reparos) => {
        const reparosMapeados: ReparoResumo[] = reparos.map((reparo) => ({
          id: Number(reparo.id),
          doacaoId: Number(reparo.idDoacao),
          equipamento: String(reparo.equipamentoDoacao ?? '--'),
          status: reparo.dataFim ? 'FINALIZADO' : 'EM ANDAMENTO',
          data: this.formatarDataCadastro(reparo.dataFim ?? reparo.dataInicio)
        }));

        this.tecnico = {
          ...this.tecnico,
          reparosConcluidos: reparosMapeados.filter((reparo) => reparo.status === 'FINALIZADO'),
          reparosEmAndamento: reparosMapeados.filter((reparo) => reparo.status === 'EM ANDAMENTO')
        };
      },
      error: (erro) => {
        console.error('Erro ao buscar reparos do técnico:', erro);
      }
    });
  }

  preencherFormulario(): void {
    this.tecnicoForm.patchValue({
      email: this.tecnico.email,
      nome: this.tecnico.nome,
      cpf: formatarCpf(this.tecnico.cpf),
      grr: this.tecnico.grr,
      curso: this.tecnico.curso
    });
  }

  voltar(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  ativarEdicao(): void {
    this.modoEdicao = true;
    this.tecnicoForm.enable();
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    this.preencherFormulario();
    this.tecnicoForm.disable();
  }

  salvar(): void {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dadosAtualizados = {
      email: this.tecnicoForm.value.email ?? '',
      nome: this.tecnicoForm.value.nome ?? '',
      cpf: apenasNumeros(this.tecnicoForm.value.cpf),
      grr: this.tecnicoForm.value.grr ?? '',
      curso: this.tecnicoForm.value.curso ?? ''
    };

    // mock
    this.tecnico = {
      ...this.tecnico,
      ...dadosAtualizados
    };

    console.log('Técnico atualizado:', this.tecnico);

    this.snackBar.open('Aluno técnico atualizado com sucesso!', 'Fechar', {
      duration: 3000
    });

    this.carregando = false;
    this.modoEdicao = false;
    this.tecnicoForm.disable();

    // chamada api
    // this.usuarioService.atualizarUsuario(this.tecnico.id, dadosAtualizados).subscribe(...)
  }

  desativarPerfil(): void {
    if (this.acaoPerfilEmAndamento) {
      return;
    }

    this.acaoPerfilEmAndamento = true;

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja desativar este perfil?',
        mensagem: 'O técnico não poderá mais acessar a conta, mas seus registros serão preservados.',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        this.acaoPerfilEmAndamento = false;
        return;
      }

      this.usuarioService.desativarPerfil(this.tecnico.id).subscribe({
        next: () => {
          this.tecnico.ativo = false;
          this.buscarTecnicoDaApi();
          this.snackBar.open('Perfil desativado com sucesso!', 'Fechar', { duration: 3000 });
          this.acaoPerfilEmAndamento = false;
        },
        error: (erro) => {
          console.error('Erro ao desativar perfil:', erro);
          this.snackBar.open('Erro ao desativar perfil.', 'Fechar', { duration: 3000 });
          this.acaoPerfilEmAndamento = false;
        }
      });
    });
  }

  reativarPerfil(): void {
    if (this.acaoPerfilEmAndamento) {
      return;
    }

    this.acaoPerfilEmAndamento = true;

    this.usuarioService.reativarPerfil(this.tecnico.id).subscribe({
      next: () => {
        this.tecnico.ativo = true;
        this.buscarTecnicoDaApi();
        this.snackBar.open('Perfil reativado com sucesso!', 'Fechar', { duration: 3000 });
        this.acaoPerfilEmAndamento = false;
      },
      error: (erro) => {
        console.error('Erro ao reativar perfil:', erro);
        this.snackBar.open('Erro ao reativar perfil.', 'Fechar', { duration: 3000 });
        this.acaoPerfilEmAndamento = false;
      }
    });
  }

  deletar(): void {
    if (this.acaoPerfilEmAndamento) {
      return;
    }

    this.acaoPerfilEmAndamento = true;

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja desativar este perfil?',
        mensagem: 'Essa ação será permanente e deve ser usada apenas para perfis desativados.',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        this.acaoPerfilEmAndamento = false;
        return;
      }

      this.usuarioService.desativarPerfil(this.tecnico.id).subscribe({
        next: () => {
          this.snackBar.open('Perfil excluído permanentemente!', 'Fechar', {
            duration: 3000
          });

          this.tecnico.ativo = false;
          this.acaoPerfilEmAndamento = false;
        },
        error: (erro) => {
          console.error('Erro ao excluir perfil:', erro);
          this.snackBar.open('Erro ao excluir perfil.', 'Fechar', {
            duration: 3000
          });
          this.acaoPerfilEmAndamento = false;
        }
      });
    });
  }

  abrirReparoEmAndamento(idDoacao: number): void {
    this.router.navigate(['/tecnico/doacoes', idDoacao, 'reparo']);
  }

  formatarDataCadastro(data?: string): string {
    if (!data) {
      return '--';
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }

    const partesDataIso = data.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (partesDataIso) {
      const [, ano, mes, dia] = partesDataIso;
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.tecnicoForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  aplicarMascaraCpf(): void {
    const campo = this.tecnicoForm.get('cpf');
    campo?.setValue(formatarCpf(campo.value), { emitEvent: false });
  }

  aplicarMascaraGrr(): void {
    const campo = this.tecnicoForm.get('grr');
    campo?.setValue(normalizarGrr(campo.value), { emitEvent: false });
  }
}
