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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
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
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-configuracao-perfil.html',
  styleUrl: './pagina-configuracao-perfil.css'
})
export class PaginaConfiguracaoPerfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private usuarioService = inject(UsuarioService);

  salvando = false;
  editando = false;

  private dadosMockados = {
    nome: 'Maria da Luz',
    cpf: '12345678900',
    email: 'maria.luz@email.com'
  };

  perfilForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.preencherFormulario();
    this.perfilForm.disable();
  }

  salvar(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.salvando = true;

    this.dadosMockados = {
      nome: this.perfilForm.value.nome ?? '',
      cpf: apenasNumeros(this.perfilForm.value.cpf),
      email: this.perfilForm.value.email ?? ''
    };

    setTimeout(() => {
      this.salvando = false;
      this.editando = false;
      this.perfilForm.disable();
      this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
        duration: 3000
      });
    }, 500);
  }

  editar(): void {
    this.editando = true;
    this.perfilForm.enable();
  }

  cancelarEdicao(): void {
    this.editando = false;
    this.preencherFormulario();
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
    return this.salvando || (this.editando && this.perfilForm.invalid);
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
        mensagem: 'Tem certeza que deseja deletar perfil? Essa ação será permanente.',
        tipo: 'warning',
        textoConfirmar: 'Deletar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        const idUsuario = this.obterIdUsuarioLogado();

        if (!idUsuario) {
          this.snackBar.open('Não foi possível identificar o usuário logado.', 'Fechar', {
            duration: 4000
          });
          return;
        }

        this.usuarioService.desativarPerfil(idUsuario).subscribe({
          next: () => {
            localStorage.clear();
            this.snackBar.open('Perfil desativado com sucesso.', 'Fechar', {
              duration: 3000
            });
            this.router.navigate(['/']);
          },
          error: (erro) => {
            console.error('Erro ao desativar perfil:', erro);
            this.snackBar.open('Erro ao desativar perfil.', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  preencherFormulario(): void {
    this.perfilForm.patchValue({
      nome: this.dadosMockados.nome,
      cpf: formatarCpf(this.dadosMockados.cpf),
      email: this.dadosMockados.email
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

  private obterIdUsuarioLogado(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const id = Number(localStorage.getItem('idUsuario'));
    return Number.isNaN(id) ? null : id;
  }
}
