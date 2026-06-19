import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { Doacao } from '../../../../core/models/doacao.mode';
import { HistoricoDoacao } from '../../../../core/models/doacao.model';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { abrirModalAviso, abrirModalCarregamento } from '../../../../shared/utils/modal-feedback';

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
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);
  private changeDetector = inject(ChangeDetectorRef);

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
      reader.onload = () => {
        this.imagensPreview = [...this.imagensPreview, reader.result as string];
        this.changeDetector.detectChanges();
      };
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

  confirmar(formDirective: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      abrirModalAviso(
        this.dialog,
        'Dados incompletos',
        'Preencha os campos obrigatorios e selecione pelo menos uma imagem.',
        'warning'
      );
      return;
    }

    const dadosDoacao: Doacao = {
      equipamento: this.form.value.tipoItem!,
      descricao: this.form.value.descricao!,
      conservacao: this.form.value.estadoConservacao!,
      imagens: this.form.value.imagens!
    };

    const modalCarregamento = abrirModalCarregamento(
      this.dialog,
      'Registrando doacao',
      'Aguarde enquanto sua doacao e enviada para avaliacao.'
    );

    this.doacaoService.cadastrarDoacao(dadosDoacao).subscribe({
      next: (doacaoCriada) => {
        if (!doacaoCriada.id) {
          modalCarregamento.close();
          this.abrirModalCadastroConcluido(doacaoCriada);
          this.resetarFormulario(formDirective);
          return;
        }

        this.doacaoService.obterAvaliacaoIa(doacaoCriada.id).subscribe({
          next: (avaliacao) => {
            modalCarregamento.close();
            this.abrirModalCadastroConcluido(doacaoCriada, avaliacao);
            this.resetarFormulario(formDirective);
          },
          error: (error) => {
            console.error('Erro ao buscar avaliacao da IA:', error);
            modalCarregamento.close();
            this.abrirModalCadastroConcluido(doacaoCriada);
            this.resetarFormulario(formDirective);
          }
        });
      },
      error: (error) => {
        console.error('Erro ao cadastrar doação:', error);
        modalCarregamento.close();
        abrirModalAviso(
          this.dialog,
          'Erro ao cadastrar doacao',
          'Nao foi possivel registrar sua doacao. Tente novamente.',
          'error'
        );
      }
    });
  }

  private abrirModalCadastroConcluido(doacao: DoacaoDTO, avaliacao?: HistoricoDoacao): void {
    const status = avaliacao?.status ?? doacao.status ?? 'PENDENTE';
    const observacao = avaliacao?.observacao || 'A avaliacao foi registrada, mas nao retornou uma observacao.';

    abrirModalAviso(
      this.dialog,
      'Doacao avaliada',
      `Status da doacao: ${this.formatarStatus(status)}\n\nAvaliacao da IA: ${observacao}`,
      'success'
    );
  }

  private formatarStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  private resetarFormulario(formDirective: FormGroupDirective): void {
    formDirective.resetForm({
      tipoItem: '',
      descricao: '',
      estadoConservacao: 'USADO',
      imagens: []
    });
    this.imagensPreview = [];
    this.nomesArquivos = [];
    this.erroImagem = '';
  }

  cancelar(formDirective: FormGroupDirective): void {
    this.resetarFormulario(formDirective);
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
