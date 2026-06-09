import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, forkJoin, of } from 'rxjs';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { SolicitacaoResponseDTO } from '../../../../core/dto/solicitacao.response';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { SolicitacaoService } from '../../../../core/services/solicitacao.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
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
  ativo: boolean;
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
    MatDialogModule
  ],
  templateUrl: './pagina-detalhes-usuario.html',
  styleUrls: ['./pagina-detalhes-usuario.css']
})
export class PaginaDetalhesUsuario implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private usuarioService = inject(UsuarioService);
  private doacaoService = inject(DoacaoService);
  private solicitacaoService = inject(SolicitacaoService);
  private cdr = inject(ChangeDetectorRef);

  idUsuario = Number(this.route.snapshot.paramMap.get('id'));

  modoEdicao = false;
  carregando = false;
  acaoPerfilEmAndamento = false;
  cursos = CURSOS;

  usuario: UsuarioDetalhes = {
    id: this.idUsuario || 0,
    email: '',
    nome: '',
    cpf: '',
    grr: '',
    curso: '',
    dataCadastro: '',
    ativo: true,
    doacoes: [],
    solicitacoes: []
  };

  usuarioForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]],
    grr: ['', [Validators.pattern(/^\d{8}$/)]],
    curso: ['']
  });

  ngOnInit(): void {
    this.usuarioForm.disable();
    this.buscarUsuarioDaApi();
  }

  buscarUsuarioDaApi(): void {
    if (!this.idUsuario) {
      this.abrirModalAviso('Usuario nao encontrado', 'Nao foi possivel identificar o usuario selecionado.', 'error');
      return;
    }

    this.usuarioService.buscarPorId(this.idUsuario).subscribe({
      next: (usuario) => {
        this.usuario = {
          ...this.usuario,
          id: usuario.id,
          nome: usuario.nome,
          cpf: usuario.cpf,
          email: usuario.email,
          dataCadastro: usuario.dataCadastro ?? this.usuario.dataCadastro,
          ativo: usuario.ativo ?? this.usuario.ativo,
          grr: usuario.grr ?? '',
          curso: usuario.curso ?? ''
        };
        this.preencherFormulario();
        this.usuarioForm.disable();
        this.carregarDadosRelacionados();
      },
      error: (erro) => {
        console.error('Erro ao buscar usuario:', erro);
        
      }
    });
  }

  carregarDadosRelacionados(): void {
    forkJoin({
      doacoes: this.doacaoService.listarDoacoesPorUsuario(this.usuario.id).pipe(
        catchError((erro) => {
          console.error('Erro ao buscar doacoes do usuario:', erro);
          return of([]);
        })
      ),
      solicitacoes: this.solicitacaoService.listarSolicitacoesPorUsuario(this.usuario.id).pipe(
        catchError((erro) => {
          console.error('Erro ao buscar solicitacoes do usuario:', erro);
          return of([]);
        })
      )
    }).subscribe(({ doacoes, solicitacoes }) => {
      const doacoesResumo = Array.isArray(doacoes)
        ? doacoes.map((doacao) => this.mapearDoacaoResumo(doacao))
        : [];
      const solicitacoesResumo = Array.isArray(solicitacoes)
        ? solicitacoes.map((solicitacao) => this.mapearSolicitacaoResumo(solicitacao))
        : [];

      this.usuario = {
        ...this.usuario,
        doacoes: doacoesResumo,
        solicitacoes: solicitacoesResumo
      };
      this.cdr.detectChanges();
    });
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
    const voltarPara = this.route.snapshot.queryParamMap.get('voltarPara');

    if (voltarPara?.startsWith('/admin/')) {
      this.router.navigateByUrl(voltarPara);
      return;
    }

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

    this.usuarioService.atualizarUsuario(this.usuario.id, dadosAtualizados).subscribe({
      next: (usuarioAtualizado) => {
        this.usuario = {
          ...this.usuario,
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          cpf: usuarioAtualizado.cpf,
          email: usuarioAtualizado.email,
          dataCadastro: usuarioAtualizado.dataCadastro ?? this.usuario.dataCadastro,
          ativo: usuarioAtualizado.ativo ?? this.usuario.ativo,
          grr: usuarioAtualizado.grr ?? this.usuario.grr,
          curso: usuarioAtualizado.curso ?? this.usuario.curso
        };

        this.preencherFormulario();
        this.carregando = false;
        this.modoEdicao = false;
        this.usuarioForm.disable();
        this.abrirModalAviso('Usuario atualizado', 'Os dados do perfil foram atualizados com sucesso.', 'success');
      },
      error: (erro) => {
        console.error('Erro ao atualizar usuario:', erro);
        this.carregando = false;
        this.abrirModalAviso('Erro ao atualizar usuario', 'Nao foi possivel salvar as alteracoes do perfil.', 'error');
      }
    });
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
        mensagem: 'O usuario nao podera mais acessar a conta, mas seus registros serao preservados.',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        this.finalizarAcaoPerfil();
        return;
      }

      this.usuarioService.desativarPerfil(this.usuario.id).subscribe({
        next: (usuarioAtualizado) => {
          this.usuario = {
            ...this.usuario,
            ativo: usuarioAtualizado.ativo ?? false
          };
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Perfil desativado', 'O perfil foi desativado com sucesso.', 'success');
          });
        },
        error: (erro) => {
          console.error('Erro ao desativar perfil:', erro);
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Erro ao desativar perfil', this.mensagemErroPerfil(erro, 'desativar'), 'error');
          });
        }
      });
    });
  }

  reativarPerfil(): void {
    if (this.acaoPerfilEmAndamento) {
      return;
    }

    this.acaoPerfilEmAndamento = true;

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja reativar este perfil?',
        mensagem: 'O usuario voltara a poder acessar a conta.',
        textoConfirmar: 'Reativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        this.finalizarAcaoPerfil();
        return;
      }

      this.usuarioService.reativarPerfil(this.usuario.id).subscribe({
        next: (usuarioAtualizado) => {
          this.usuario = {
            ...this.usuario,
            ativo: usuarioAtualizado.ativo ?? true
          };
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Perfil reativado', 'O perfil foi reativado com sucesso.', 'success');
          });
        },
        error: (erro) => {
          console.error('Erro ao reativar perfil:', erro);
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Erro ao reativar perfil', this.mensagemErroPerfil(erro, 'reativar'), 'error');
          });
        }
      });
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
        mensagem: 'Essa acao deve ser usada apenas para perfis desativados.',
        textoConfirmar: 'Desativar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        this.finalizarAcaoPerfil();
        return;
      }

      this.usuarioService.desativarPerfil(this.usuario.id).subscribe({
        next: () => {
          this.usuario.ativo = false;
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Perfil desativado', 'O perfil foi desativado com sucesso.', 'success');
          });
        },
        error: (erro) => {
          console.error('Erro ao desativar perfil:', erro);
          this.finalizarAcaoPerfil(() => {
            this.abrirModalAviso('Erro ao desativar perfil', 'Nao foi possivel desativar este perfil.', 'error');
          });
        }
      });
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

  private abrirModalAviso(
    titulo: string,
    mensagem: string,
    tipo: 'success' | 'error' | 'warning' | 'confirm' = 'warning'
  ) {
    return this.dialog.open(DialogBaseComponent, {
      width: '420px',
      data: {
        tipo,
        titulo,
        mensagem,
        textoConfirmar: 'OK'
      }
    });
  }

  private mapearDoacaoResumo(doacao: DoacaoDTO): DoacaoResumo {
    return {
      id: doacao.id,
      equipamento: doacao.equipamento ?? '-',
      status: doacao.status ?? '-',
      data: this.formatarDataResumo(doacao.dataCadastro)
    };
  }

  private mapearSolicitacaoResumo(solicitacao: SolicitacaoResponseDTO): SolicitacaoResumo {
    return {
      id: solicitacao.id,
      equipamento: solicitacao.equipamento ?? '-',
      status: solicitacao.status ?? '-',
      data: this.formatarDataResumo(solicitacao.dataCadastro)
    };
  }

  private formatarDataResumo(data?: string): string {
    if (!data) {
      return '-';
    }

    const [ano, mes, dia] = data.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  }

  private finalizarAcaoPerfil(aposFinalizar?: () => void): void {
    setTimeout(() => {
      this.acaoPerfilEmAndamento = false;
      this.cdr.detectChanges();
      aposFinalizar?.();
    });
  }

  private mensagemErroPerfil(erro: any, acao: 'desativar' | 'reativar'): string {
    if (erro?.status === 403) {
      return 'Seu usuario nao tem permissao para alterar este perfil.';
    }

    if (erro?.error?.message) {
      return erro.error.message;
    }

    return `Nao foi possivel ${acao} este perfil.`;
  }
}
