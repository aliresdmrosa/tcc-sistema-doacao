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

  imagemPreview: string | null = null;
  nomeArquivo = 'Nenhum arquivo selecionado';

  form = this.fb.group({
    tipoItem: ['', Validators.required],
    descricao: ['', [Validators.required, Validators.minLength(5)]],
    estadoConservacao: ['USADO', Validators.required],
    imagem: [null as File | null]
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

    const arquivo = input.files[0];
    this.nomeArquivo = arquivo.name;
    this.form.patchValue({ imagem: arquivo });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPreview = reader.result as string;
    };
    reader.readAsDataURL(arquivo);
  }

  removerImagem(): void {
    this.imagemPreview = null;
    this.nomeArquivo = 'Nenhum arquivo selecionado';
    this.form.patchValue({ imagem: null });
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
      imagem: this.form.value.imagem!
    };

    this.doacaoService.cadastrarDoacao(dadosDoacao).subscribe({
      next: (doacao) => {
        console.log('Doação cadastrada com sucesso:', doacao);
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          disableClose: true,
          data: {
            tipo: 'success',
            icone: 'celebration',
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
      imagem: null
    });
    this.imagemPreview = null;
    this.nomeArquivo = 'Nenhum arquivo selecionado';
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
}
