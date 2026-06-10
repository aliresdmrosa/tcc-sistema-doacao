import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Usuario, UsuarioAtualizacaoRequest } from '../../../../core/models/usuario.model';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { abrirModalAviso, abrirModalCarregamento } from '../../../../shared/utils/modal-feedback';
import { apenasNumeros, formatarCpf } from '../../../../shared/utils/form-validations';

@Component({
  selector: 'app-pagina-configuracao-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './pagina-configuracao-perfil.html',
  styleUrl: './pagina-configuracao-perfil.css'
})
export class PaginaConfiguracaoPerfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private usuarioService = inject(UsuarioService);

  salvando = false;
  carregando = false;
  editando = false;
  private usuarioLogado: Usuario | null = null;

  perfilForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.perfilForm.disable();
    this.carregarUsuarioLogado();
  }

  carregarUsuarioLogado(): void {
    const idUsuario = this.obterIdUsuarioLogado();

    if (!idUsuario) {
      abrirModalAviso(
        this.dialog,
        'Usuario nao identificado',
        'Nao foi possivel carregar seus dados porque o usuario logado nao foi identificado.',
        'error'
      );
      return;
    }

    this.carregando = true;

    this.usuarioService.buscarPorId(idUsuario).subscribe({
      next: (usuario) => {
        this.carregando = false;
        this.usuarioLogado = usuario;
        this.preencherFormulario(usuario);
      },
      error: (erro) => {
        console.error('Erro ao carregar perfil:', erro);
        this.carregando = false;
        abrirModalAviso(
          this.dialog,
          'Erro ao carregar perfil',
          'Nao foi possivel carregar seus dados. Tente novamente.',
          'error'
        );
      }
    });
  }

  salvar(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const idUsuario = this.obterIdUsuarioLogado();

    if (!idUsuario) {
      abrirModalAviso(
        this.dialog,
        'Usuario nao identificado',
        'Nao foi possivel identificar o usuario logado.',
        'error'
      );
      return;
    }

    const valores = this.perfilForm.getRawValue();
    const dadosAtualizados: UsuarioAtualizacaoRequest = {
      nome: valores.nome ?? '',
      cpf: apenasNumeros(valores.cpf),
      email: valores.email ?? ''
    };

    this.salvando = true;

    const modalCarregamento = abrirModalCarregamento(
      this.dialog,
      'Atualizando perfil',
      'Aguarde enquanto seus dados sao salvos.'
    );

    this.usuarioService.atualizarUsuario(idUsuario, dadosAtualizados).subscribe({
      next: (usuarioAtualizado) => {
        modalCarregamento.close();
        this.salvando = false;
        this.editando = false;
        this.usuarioLogado = usuarioAtualizado;
        this.preencherFormulario(usuarioAtualizado);
        this.perfilForm.disable();
        this.perfilForm.markAsPristine();
        this.perfilForm.markAsUntouched();
        this.atualizarDadosLocais(usuarioAtualizado);
        abrirModalAviso(
          this.dialog,
          'Perfil atualizado',
          'Seus dados foram atualizados com sucesso.',
          'success'
        );
      },
      error: (erro) => {
        console.error('Erro ao atualizar perfil:', erro);
        modalCarregamento.close();
        this.salvando = false;
        abrirModalAviso(
          this.dialog,
          'Erro ao atualizar perfil',
          'Nao foi possivel atualizar seus dados. Tente novamente.',
          'error'
        );
      }
    });
  }

  editar(): void {
    this.editando = true;
    this.perfilForm.enable();
  }

  cancelarEdicao(): void {
    this.editando = false;
    if (this.usuarioLogado) {
      this.preencherFormulario(this.usuarioLogado);
    }
    this.perfilForm.disable();
    this.perfilForm.markAsPristine();
    this.perfilForm.markAsUntouched();
  }

  enviar(): void {
    if (!this.editando) {
      this.editar();
      return;
    }

    this.salvar();
  }

  textoBotaoPrincipal(): string {
    if (this.salvando) {
      return 'Enviando...';
    }

    return this.editando ? 'Enviar' : 'Editar';
  }

  botaoPrincipalDesabilitado(): boolean {
    return this.carregando || this.salvando || (this.editando && this.perfilForm.invalid);
  }

  voltar(): void {
    this.router.navigate(['/usuario']);
  }

  redefinirSenha(): void {
    this.router.navigate(['/redefinir-senha']);
  }

  excluirPerfil(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '460px',
      data: {
        titulo: 'Deletar perfil',
        mensagem: 'Tem certeza que deseja deletar perfil? Essa acao sera permanente.',
        tipo: 'warning',
        textoConfirmar: 'Deletar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      const idUsuario = this.obterIdUsuarioLogado();

      if (!idUsuario) {
        abrirModalAviso(
          this.dialog,
          'Usuario nao identificado',
          'Nao foi possivel identificar o usuario logado.',
          'error'
        );
        return;
      }

      const modalCarregamento = abrirModalCarregamento(
        this.dialog,
        'Desativando perfil',
        'Aguarde enquanto seu perfil e desativado.'
      );

      this.usuarioService.desativarPerfil(idUsuario).subscribe({
        next: () => {
          modalCarregamento.close();
          localStorage.clear();
          abrirModalAviso(
            this.dialog,
            'Perfil desativado',
            'Seu perfil foi desativado com sucesso.',
            'success'
          ).afterClosed().subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: (erro) => {
          console.error('Erro ao desativar perfil:', erro);
          modalCarregamento.close();
          abrirModalAviso(
            this.dialog,
            'Erro ao desativar perfil',
            'Nao foi possivel desativar seu perfil. Tente novamente.',
            'error'
          );
        }
      });
    });
  }

  preencherFormulario(usuario: Usuario): void {
    this.perfilForm.patchValue({
      nome: usuario.nome,
      cpf: formatarCpf(usuario.cpf),
      email: usuario.email
    });
  }
  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.perfilForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  aplicarMascaraCpf(): void {
    const campo = this.perfilForm.get('cpf');
    const valorFormatado = formatarCpf(campo?.value);
    campo?.setValue(valorFormatado, { emitEvent: false });
  }

  private atualizarDadosLocais(usuario: Usuario): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem('email', usuario.email);
    localStorage.setItem('nomeUsuario', usuario.nome);
  }

  private obterIdUsuarioLogado(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const id = Number(localStorage.getItem('idUsuario'));
    return Number.isNaN(id) ? null : id;
  }
}
