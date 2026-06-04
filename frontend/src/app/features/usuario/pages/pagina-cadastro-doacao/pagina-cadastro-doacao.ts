import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Doacao } from '../../../../core/models/doacao.mode';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

@Component({
  selector: 'app-pagina-cadastro-doacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './pagina-cadastro-doacao.html',
  styleUrl: './pagina-cadastro-doacao.css'
})
export class PaginaCadastroDoacao {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);

  imagensPreview: string[] = [];
  nomesArquivos: string[] = [];
  erroImagem = '';
  private readonly tamanhoMaximoImagem = 5 * 1024 * 1024;
  private readonly tiposImagemPermitidos = ['image/jpeg', 'image/png'];

  form = this.fb.group({
    tipoItem: ['', Validators.required],
    descricao: ['', [Validators.required, Validators.minLength(5)]],
    estadoConservacao: ['USADO', Validators.required],
    imagens: [[] as File[], Validators.required]
  });

  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];

  voltar(): void {
    this.router.navigate(['/usuario/listar-doacoes']);
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivosAtuais = this.form.value.imagens ?? [];
    const novosArquivos = Array.from(input.files);
    this.erroImagem = '';

    if (arquivosAtuais.length + novosArquivos.length > 3) {
      input.value = '';
      this.erroImagem = 'Selecione no máximo 3 imagens.';
      return;
    }

    if (novosArquivos.some((arquivo) => !this.tiposImagemPermitidos.includes(arquivo.type))) {
      this.rejeitarImagem(input, 'Selecione uma imagem nos formatos JPG ou PNG.');
      return;
    }

    if (novosArquivos.some((arquivo) => arquivo.size > this.tamanhoMaximoImagem)) {
      this.rejeitarImagem(input, 'Selecione imagens de até 5 MB cada.');
      return;
    }

    const imagens = [...arquivosAtuais, ...novosArquivos];
    this.form.patchValue({ imagens });
    this.form.get('imagens')?.setErrors(null);
    this.nomesArquivos = imagens.map((arquivo) => arquivo.name);
    novosArquivos.forEach((arquivo) => {
      const reader = new FileReader();
      reader.onload = () => this.imagensPreview.push(reader.result as string);
      reader.readAsDataURL(arquivo);
    });
    input.value = '';
  }

  removerImagem(indice: number): void {
    const imagens = [...(this.form.value.imagens ?? [])];
    imagens.splice(indice, 1);
    this.imagensPreview.splice(indice, 1);
    this.nomesArquivos.splice(indice, 1);
    this.erroImagem = '';
    this.form.patchValue({ imagens });
    this.form.get('imagens')?.setErrors(imagens.length ? null : { required: true });
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    console.log('Dados da doação:', payload);

    const dadosDoacao: Doacao = {
      equipamento: this.form.value.tipoItem!,
      descricao: this.form.value.descricao!,
      conservacao: this.form.value.estadoConservacao!,
      imagens: this.form.value.imagens!
    };

    this.doacaoService.cadastrarDoacao(dadosDoacao).subscribe({
      next: (doacao) => {
        console.log('Doação cadastrada com sucesso:', doacao);
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          disableClose: true,
          data: {
            tipo: 'success',
            titulo: 'Doação registrada com sucesso aguardando avaliação',
            mensagem: '',
            mostrarConfirmar: false
          }
        });
        this.resetarFormulario();
      },
      error: (error) => {
        console.error('Erro ao cadastrar doação:', error);
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          data: {
            tipo: 'error',
            titulo: 'Erro ao cadastrar doação',
            mensagem: 'Não foi possível registrar sua doação. Tente novamente.',
            textoConfirmar: 'OK'
          }
        });
      }
    });
  }

  private resetarFormulario(): void {
    this.form.reset({
      tipoItem: '',
      descricao: '',
      estadoConservacao: 'USADO',
      imagens: []
    });
    this.imagensPreview = [];
    this.nomesArquivos = [];
    this.erroImagem = '';
  }

  cancelar(): void {
    this.resetarFormulario();
  }

  get tipoItem() {
    return this.form.get('tipoItem');
  }

  get descricao() {
    return this.form.get('descricao');
  }

  get estadoConservacao() {
    return this.form.get('estadoConservacao');
  }

  private rejeitarImagem(input: HTMLInputElement, mensagem: string): void {
    input.value = '';
    this.imagensPreview = [];
    this.nomesArquivos = [];
    this.erroImagem = mensagem;
    this.form.patchValue({ imagens: [] });
    this.form.get('imagens')?.setErrors({ arquivoInvalido: true });
    this.form.get('imagens')?.markAsTouched();
  }
}
