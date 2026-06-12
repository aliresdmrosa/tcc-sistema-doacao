import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

type StatusAnalise =
  | 'PENDENTE'
  | 'REPARO'
  | 'APROVADO'
  | 'APROVADA'
  | 'APROVADO_REPARO'
  | 'REPROVADO'
  | 'REPROVADA'
  | 'ESTOQUE'
  | 'EM_ESTOQUE'
  | 'VINCULADO'
  | 'VINCULADA'
  | 'DOADO'
  | 'ENTREGUE'
  | 'DESCARTE';

interface DetalhesDoacaoAdmin {
  id: string;
  nomeDoador: string;
  cpf: string;
  tipoItem: string;
  descricao: string;
  imagem: string;
  imagensUrls: string[];
  estadoConservacao: string;
  status: StatusAnalise;
  dataCadastro: string;
  dataUltimaModificacao: string;
}

interface ImagemEdicao {
  preview: string;
  nome: string;
  arquivo?: File;
}

@Component({
  selector: 'app-pagina-detalhes-doacao-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './pagina-detalhes-doacao-admin.html',
  styleUrls: ['./pagina-detalhes-doacao-admin.css']
})
export class PaginaDetalhesDoacaoAdmin implements OnInit {
marcarDescarte() {
  console.log("deve alterar para descarte")
}


  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);
  private usuarioService = inject(UsuarioService);

  idDoacao = this.route.snapshot.paramMap.get('id');
  modoEdicao = false;
  carregando = false;
  acaoEmAndamento = false;
  private dadosAntesDaEdicao?: DetalhesDoacaoAdmin;

  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];

  doacao: DetalhesDoacaoAdmin = {
    id: this.idDoacao ?? '',
    nomeDoador: '',
    cpf: '',
    tipoItem: '',
    descricao: '',
    imagem: '',
    imagensUrls: [],
    estadoConservacao: '',
    status: 'PENDENTE',
    dataCadastro: '',
    dataUltimaModificacao: ''
  };

  imagensEdicao: ImagemEdicao[] = [];
  erroImagem = '';
  private readonly tamanhoMaximoImagem = 5 * 1024 * 1024;
  private readonly tiposImagemPermitidos = ['image/jpeg', 'image/png'];

  form = this.fb.group({
    nomeDoador: [{ value: this.doacao.nomeDoador, disabled: true }],
    cpf: [{ value: this.doacao.cpf, disabled: true }],
    tipoItem: [{ value: this.doacao.tipoItem, disabled: true }],
    descricao: [{ value: this.doacao.descricao, disabled: true }],
    imagem: [{ value: this.doacao.imagem, disabled: true }],
    estadoConservacao: [{ value: this.doacao.estadoConservacao, disabled: true }]
  });

  ngOnInit(): void {
    this.carregarDoacaoDaApi();
  }

  get podeMarcarReparo(): boolean {
    return this.statusNormalizado(this.doacao.status) === 'PENDENTE';
  }

  get podeConcluirAnalise(): boolean {
    const status = this.statusNormalizado(this.doacao.status);
    return status === 'PENDENTE' || status === 'REPARO';
  }

  get podeMarcarEntregue(): boolean {
    const status = this.statusNormalizado(this.doacao.status);
    return status === 'APROVADO' || status === 'APROVADO_REPARO';
  }

  get podeReabrirAnalise(): boolean {
    return this.statusNormalizado(this.doacao.status) !== 'PENDENTE';
  }

  podeMarcarDoado(): boolean {
    const status = this.statusNormalizado(this.doacao.status);
    return status === 'VINCULADO' || status === 'VINCULADA';
  }

  get imagemUrl(): string | null {
    const imagem = this.doacao.imagem?.trim();

    if (!imagem) {
      return null;
    }

    if (/^https?:\/\//.test(imagem)) {
      return imagem;
    }

    if (imagem.startsWith('/')) {
      return `http://localhost:8080${imagem}`;
    }

    return `http://localhost:8080/${imagem}`;
  }

  get imagensUrls(): string[] {
    if (this.doacao.imagensUrls.length) {
      return this.doacao.imagensUrls;
    }

    return this.imagemUrl ? [this.imagemUrl] : [];
  }

  carregarDoacaoDaApi(): void {
    const id = Number(this.idDoacao);

    if (!id) {
      this.abrirModalAviso('Doacao nao encontrada', 'Nao foi possivel identificar a doacao selecionada.', 'error')
        .afterClosed()
        .subscribe(() => this.voltar());
      return;
    }

    this.carregando = true;

    this.doacaoService.doacaoId(id).subscribe({
      next: (doacao) => {
        this.doacao = this.mapearDoacaoApi(doacao);
        this.preencherFormulario();
        this.form.disable();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar doacao:', erro);
        this.carregando = false;
        // this.abrirModalAviso('Erro ao carregar doacao', 'Nao foi possivel carregar os dados da doacao.', 'error')
        //   .afterClosed()
        //   .subscribe(() => this.voltar());
      }
    });
  }

  voltar(): void {
    const voltarPara = this.route.snapshot.queryParamMap.get('voltarPara');

    if (voltarPara?.startsWith('/admin/')) {
      this.router.navigateByUrl(voltarPara);
      return;
    }

    this.router.navigate(['/admin/doacoes']);
  }

  verPerfil(): void {
    const cpf = this.doacao.cpf?.replace(/\D/g, '');

    if (!cpf) {
      this.abrirModalAviso('CPF nao encontrado', 'Nao foi possivel identificar o CPF do doador.', 'warning');
      return;
    }

    this.usuarioService.buscarPorCpf(cpf).subscribe({
      next: (usuario) => {
        this.router.navigate(['/admin/usuarios', usuario.id], {
          queryParams: {
            voltarPara: `/admin/doacoes/${this.doacao.id}`
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao buscar doador por CPF:', erro);
        this.abrirModalAviso('Doador nao encontrado', 'Nao foi possivel encontrar o doador pelo CPF.', 'error');
      }
    });
  }

  editar(): void {
    this.dadosAntesDaEdicao = { ...this.doacao };
    this.imagensEdicao = this.imagensUrls.map((url, indice) => ({
      preview: url,
      nome: `Imagem atual ${indice + 1}`
    }));
    this.erroImagem = '';
    this.modoEdicao = true;
    this.form.get('tipoItem')?.enable();
    this.form.get('descricao')?.enable();
    this.form.get('estadoConservacao')?.enable();
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const novosArquivos = Array.from(input.files);
    this.erroImagem = '';

    if (this.imagensEdicao.length + novosArquivos.length > 3) {
      input.value = '';
      this.erroImagem = 'Selecione no maximo 3 imagens.';
      return;
    }

    if (novosArquivos.some((arquivo) => !this.tiposImagemPermitidos.includes(arquivo.type))) {
      this.rejeitarImagem(input, 'Selecione imagens nos formatos JPG ou PNG.');
      return;
    }

    if (novosArquivos.some((arquivo) => arquivo.size > this.tamanhoMaximoImagem)) {
      this.rejeitarImagem(input, 'Selecione imagens de ate 5 MB cada.');
      return;
    }

    novosArquivos.forEach((arquivo) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagensEdicao.push({
          preview: reader.result as string,
          nome: arquivo.name,
          arquivo
        });
      };
      reader.readAsDataURL(arquivo);
    });

    input.value = '';
  }

  removerImagem(indice: number): void {
    this.imagensEdicao.splice(indice, 1);
    this.erroImagem = '';
  }

  salvarEdicao(): void {
    const dados = this.form.getRawValue();
    const id = Number(this.doacao.id);

    if (!id) {
      this.abrirModalAviso('Doacao nao encontrada', 'Nao foi possivel identificar a doacao selecionada.', 'error');
      return;
    }

    if (!this.imagensEdicao.length) {
      this.erroImagem = 'Mantenha ou selecione pelo menos uma imagem para atualizar.';
      return;
    }

    const dialogCarregamento = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Atualizando doacao',
        mensagem: 'Aguarde enquanto as alteracoes sao salvas.',
        mostrarConfirmar: false,
        carregando: true
      }
    });

    this.acaoEmAndamento = true;
    this.obterImagensEdicaoComoArquivos()
      .then((imagens) => {
        this.doacaoService.atualizarDoacao(id, {
          equipamento: dados.tipoItem ?? '',
          descricao: dados.descricao ?? '',
          conservacao: dados.estadoConservacao ?? '',
          imagens
        }).subscribe({
          next: () => {
            this.acaoEmAndamento = false;
            this.modoEdicao = false;
            this.imagensEdicao = [];
            this.form.disable();
            dialogCarregamento.close();
            this.dialog.open(DialogBaseComponent, {
              width: '420px',
              data: {
                tipo: 'success',
                titulo: 'Doacao atualizada',
                mensagem: 'As informacoes da doacao foram atualizadas com sucesso.',
                textoConfirmar: 'OK'
              }
            });
            this.carregarDoacaoDaApi();
          },
          error: (erro) => {
            console.error('Erro ao atualizar doacao:', erro);
            this.acaoEmAndamento = false;
            dialogCarregamento.close();
            this.dialog.open(DialogBaseComponent, {
              width: '420px',
              data: {
                tipo: 'error',
                titulo: 'Erro ao atualizar doacao',
                mensagem: 'Nao foi possivel salvar as alteracoes. Tente novamente.',
                textoConfirmar: 'OK'
              }
            });
          }
        });
      })
      .catch((erro) => {
        console.error('Erro ao carregar imagem atual:', erro);
        this.acaoEmAndamento = false;
        dialogCarregamento.close();
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          data: {
            tipo: 'error',
            titulo: 'Erro ao preparar imagens',
            mensagem: 'Nao foi possivel carregar as imagens selecionadas para atualizar.',
            textoConfirmar: 'OK'
          }
        });
      });
  }

  cancelarEdicao(): void {
    if (this.dadosAntesDaEdicao) {
      this.doacao = { ...this.dadosAntesDaEdicao };
      this.preencherFormulario();
    }

    this.modoEdicao = false;
    this.imagensEdicao = [];
    this.erroImagem = '';
    this.form.disable();
  }

  marcarReparo(): void {

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Enviar para reparo?',
        mensagem: 'Confirme para alterar o status desta doacao para reparo.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.acaoEmAndamento = true;
      this.doacaoService.enviarDoacaoParaReparo(Number(this.doacao.id), 'Doacao enviada para reparo pelo administrador.').subscribe({
        next: () => {
          this.acaoEmAndamento = false;
          this.abrirModalAviso('Status alterado', 'A doacao foi enviada para reparo.', 'success');
          this.carregarDoacaoDaApi();
        },
        error: (erro) => {
          console.error('Erro ao alterar status para reparo:', erro);
          this.acaoEmAndamento = false;
          this.abrirModalAviso('Erro ao alterar status', 'Nao foi possivel enviar a doacao para reparo.', 'error');
        }
      });
    });
  }

  marcarEmEstoque(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Mover para estoque?',
        mensagem: 'Confirme para alterar o status desta doacao para estoque.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      const modalCarregamento = this.abrirModalCarregamento(
        'Movendo para estoque',
        'Aguarde enquanto o status da doacao e atualizado.'
      );

      this.acaoEmAndamento = true;
      this.doacaoService.enviarDoacaoParaEstoque(Number(this.doacao.id), 'Doacao enviada para estoque pelo administrador.').subscribe({
        next: () => {
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso('Doacao em estoque', 'A doacao foi movida para estoque.', 'success');
          this.carregarDoacaoDaApi();
        },
        error: (erro) => {
          console.error('Erro ao alterar status para estoque:', erro);
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso('Erro ao mover doacao', 'Nao foi possivel mover a doacao para estoque.', 'error');
        }
      });
    });
  }

  aprovar(): void {
    this.confirmarAlteracaoStatus(
      'Aprovar doacao?',
      'Confirme para alterar o status desta doacao para aprovada.',
      'APROVADO',
      'Doacao aprovada com sucesso!'
    );
  }

  reprovar(): void {
    this.confirmarAlteracaoStatus(
      'Reprovar doacao?',
      'Confirme para alterar o status desta doacao para reprovada.',
      'REPROVADO',
      'Doacao reprovada com sucesso!'
    );
  }

  aprovarParaReparo(): void {
    this.confirmarAlteracaoStatus(
      'Aprovar para reparo?',
      'Confirme para alterar o status desta doacao para aprovada para reparo.',
      'APROVADO_REPARO',
      'Doacao aprovada para reparo com sucesso!'
    );
  }

  entregar(): void {
    if (!this.podeMarcarEntregue) {
      this.abrirModalAviso(
        'Acao indisponivel',
        'A doacao so pode ser entregue quando estiver aprovada ou aprovada para reparo.',
        'warning'
      );
      return;
    }

    this.confirmarAlteracaoStatus(
      'Marcar como entregue?',
      'Confirme que o equipamento foi entregue.',
      'ENTREGUE',
      'Doacao marcada como entregue!'
    );
  }

  reabrirAnalise(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Reabrir analise?',
        mensagem: 'Confirme para alterar o status desta doacao para pendente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      const modalCarregamento = this.abrirModalCarregamento(
        'Reabrindo analise',
        'Aguarde enquanto o status da doacao e atualizado.'
      );

      this.acaoEmAndamento = true;
      this.doacaoService.enviarDoacaoParaPendente(Number(this.doacao.id), 'Analise reaberta pelo administrador.').subscribe({
        next: () => {
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso('Analise reaberta', 'A doacao voltou para o status pendente.', 'success');
          this.carregarDoacaoDaApi();
        },
        error: (erro) => {
          console.error('Erro ao reabrir analise:', erro);
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso('Erro ao reabrir analise', 'Nao foi possivel alterar o status da doacao para pendente.', 'error');
        }
      });
    });
  }

  marcarAprovadoReparo(): void {
    this.confirmarAlteracaoStatusDireta({
      tituloConfirmacao: 'Marcar como aprovado reparo?',
      mensagemConfirmacao: 'Confirme para alterar o status desta doacao para aprovado reparo.',
      tituloCarregamento: 'Atualizando status',
      mensagemCarregamento: 'Aguarde enquanto a doacao e marcada como aprovado reparo.',
      tituloSucesso: 'Doacao aprovada para reparo',
      mensagemSucesso: 'A doacao foi marcada como aprovado reparo.',
      mensagemErro: 'Nao foi possivel marcar a doacao como aprovado reparo.',
      requisicao: (id) => this.doacaoService.enviarDoacaoParaAprovadoReparo(
        id,
        'Doacao marcada como aprovado reparo pelo administrador.'
      )
    });
  }

  marcarDoado(): void {
    this.confirmarAlteracaoStatusDireta({
      tituloConfirmacao: 'Marcar como doado?',
      mensagemConfirmacao: 'Confirme para alterar o status desta doacao para doado.',
      tituloCarregamento: 'Atualizando status',
      mensagemCarregamento: 'Aguarde enquanto a doacao e marcada como doada.',
      tituloSucesso: 'Doacao marcada como doada',
      mensagemSucesso: 'A doacao foi marcada como doada.',
      mensagemErro: 'Nao foi possivel marcar a doacao como doada.',
      requisicao: (id) => this.doacaoService.enviarDoacaoParaDoado(
        id,
        'Doacao marcada como doada pelo administrador.'
      )
    });
  }

  deletar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta doacao?',
        mensagem: 'Essa acao sera permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.doacaoService.deletarDoacao(Number(this.doacao.id)).subscribe({
        next: () => {
          this.abrirModalAviso('Doacao excluida', 'A doacao foi excluida com sucesso.', 'success')
            .afterClosed()
            .subscribe(() => this.voltar());
        },
        error: (erro) => {
          console.error('Erro ao deletar doacao:', erro);
          this.abrirModalAviso('Erro ao excluir doacao', 'Nao foi possivel excluir a doacao.', 'error');
        }
      });
    });
  }

  obterClasseStatus(status: string): string {
    switch (this.statusNormalizado(status)) {
      case 'APROVADA':
      case 'APROVADO':
      case 'APROVADO_REPARO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
      case 'DESCARTE':
        return 'status-reprovado';
      case 'REPARO':
        return 'status-analise';
      case 'EM_ESTOQUE':
      case 'ESTOQUE':
      case 'VINCULADA':
      case 'VINCULADO':
      case 'DOADO':
      case 'ENTREGUE':
        return 'status-entregue';
      case 'PENDENTE':
        return 'status-pendente';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status: string): string {
    switch (this.statusNormalizado(status)) {
      case 'APROVADA':
      case 'APROVADO':
        return 'Aprovada';
      case 'APROVADO_REPARO':
        return 'Aprovada_Reparo'
      case 'REPROVADA':
      case 'REPROVADO':
        return 'Reprovada';
      case 'REPARO':
        return 'Reparo';
      case 'EM_ESTOQUE':
      case 'ESTOQUE':
        return 'Em estoque';
      case 'ENTREGUE':
        return 'Entregue';
      case 'VINCULADA':
      case 'VINCULADO':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      case 'DESCARTE':
        return 'Descarte';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  private podeExecutarAlteracaoStatus(status: StatusAnalise): boolean {
    if (status === 'ENTREGUE') {
      return this.podeMarcarEntregue;
    }

    return this.podeConcluirAnalise;
  }

  private alterarStatus(status: StatusAnalise, mensagem: string): void {
    const id = Number(this.doacao.id);
    const requisicao = this.obterRequisicaoAlteracaoStatus(id, status, mensagem);

    if (!requisicao) {
      return;
    }

    const statusNormalizado = this.statusNormalizado(status);
    const statusAprovado = statusNormalizado === 'APROVADO';
    const statusReprovado = statusNormalizado === 'REPROVADO';
    const modalCarregamento = this.abrirModalCarregamento(
      statusAprovado
        ? 'Aprovando doacao'
        : statusReprovado
          ? 'Reprovando doacao'
          : 'Atualizando doacao',
      'Aguarde enquanto o status da doacao e atualizado.'
    );

    this.acaoEmAndamento = true;

    requisicao.subscribe({
      next: () => {
        this.acaoEmAndamento = false;
        modalCarregamento.close();
        this.abrirModalAviso(
          statusAprovado
            ? 'Doacao aprovada'
            : statusReprovado
              ? 'Doacao reprovada'
              : 'Status atualizado',
          mensagem,
          'success'
        );
        this.carregarDoacaoDaApi();
      },
      error: (erro) => {
        console.error('Erro ao alterar status da doacao:', erro);
        this.acaoEmAndamento = false;
        modalCarregamento.close();
        this.abrirModalAviso('Erro ao alterar status', 'Nao foi possivel alterar o status da doacao.', 'error');
      }
    });
  }

  private obterRequisicaoAlteracaoStatus(id: number, status: StatusAnalise, motivo: string) {
    switch (status) {
      case 'APROVADO':
        return this.doacaoService.aprovarDoacao(id, motivo);
      case 'APROVADO_REPARO':
        return this.doacaoService.aprovarDoacaoParaReparo(id, motivo);
      case 'REPROVADO':
        return this.doacaoService.reprovarDoacao(id, motivo);
      case 'ENTREGUE':
        return this.doacaoService.entregarDoacao(id, motivo);
      default:
        return null;
    }
  }

  private confirmarAlteracaoStatus(
    titulo: string,
    mensagem: string,
    status: StatusAnalise,
    mensagemSucesso: string
  ): void {
    if (!this.podeExecutarAlteracaoStatus(status)) {
      this.abrirModalAviso('Acao indisponivel', 'Esta acao so pode ser feita quando a doacao esta pendente ou em reparo.', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo,
        mensagem,
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.alterarStatus(status, mensagemSucesso);
    });
  }

  private confirmarAlteracaoStatusDireta(config: {
    tituloConfirmacao: string;
    mensagemConfirmacao: string;
    tituloCarregamento: string;
    mensagemCarregamento: string;
    tituloSucesso: string;
    mensagemSucesso: string;
    mensagemErro: string;
    requisicao: (id: number) => ReturnType<DoacaoService['enviarDoacaoParaDoado']>;
  }): void {
    const id = Number(this.doacao.id);

    if (!id) {
      this.abrirModalAviso('Doacao nao encontrada', 'Nao foi possivel identificar a doacao selecionada.', 'error');
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: config.tituloConfirmacao,
        mensagem: config.mensagemConfirmacao,
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      const modalCarregamento = this.abrirModalCarregamento(
        config.tituloCarregamento,
        config.mensagemCarregamento
      );

      this.acaoEmAndamento = true;
      config.requisicao(id).subscribe({
        next: () => {
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso(config.tituloSucesso, config.mensagemSucesso, 'success');
          this.carregarDoacaoDaApi();
        },
        error: (erro) => {
          console.error('Erro ao alterar status da doacao:', erro);
          this.acaoEmAndamento = false;
          modalCarregamento.close();
          this.abrirModalAviso('Erro ao alterar status', config.mensagemErro, 'error');
        }
      });
    });
  }

  private preencherFormulario(): void {
    this.form.patchValue({
      nomeDoador: this.doacao.nomeDoador,
      cpf: this.doacao.cpf,
      tipoItem: this.doacao.tipoItem,
      descricao: this.doacao.descricao,
      imagem: this.doacao.imagem,
      estadoConservacao: this.doacao.estadoConservacao
    });
  }

  private mapearDoacaoApi(doacao: DoacaoDTO): DetalhesDoacaoAdmin {
    const primeiraImagem = doacao.imagens?.[0]?.url ?? doacao.url ?? '';
    const imagensUrls = doacao.imagens
      ?.map((imagem) => this.montarImagemUrl(imagem.url))
      .filter((url): url is string => !!url) ?? [];

    return {
      id: String(doacao.id),
      nomeDoador: doacao.nome ?? '',
      cpf: doacao.cpf ?? '',
      tipoItem: doacao.equipamento ?? '',
      descricao: doacao.descricao ?? '',
      imagem: primeiraImagem,
      imagensUrls,
      estadoConservacao: doacao.statusConservacao ?? '',
      status: this.converterStatus(doacao.status),
      dataCadastro: doacao.dataCadastro ?? '',
      dataUltimaModificacao: doacao.dataAlteracaoStatus ?? doacao.dataCadastro ?? ''
    };
  }

  private montarImagemUrl(imagem: unknown): string | null {
    if (typeof imagem !== 'string' || !imagem.trim()) {
      return null;
    }

    const valor = imagem.trim();

    if (/^https?:\/\//.test(valor)) {
      return valor;
    }

    if (valor.startsWith('/')) {
      return `http://localhost:8080${valor}`;
    }

    return `http://localhost:8080/${valor}`;
  }

  private converterStatus(status?: string): StatusAnalise {
    const normalizado = this.statusNormalizado(status);

    switch (normalizado) {
      case 'APROVADO':
      case 'APROVADA':
      case 'APROVADO_REPARO':
      case 'REPROVADO':
      case 'REPROVADA':
      case 'REPARO':
      case 'PENDENTE':
      case 'ESTOQUE':
      case 'EM_ESTOQUE':
      case 'VINCULADO':
      case 'VINCULADA':
      case 'DOADO':
      case 'ENTREGUE':
      case 'DESCARTE':
        return normalizado as StatusAnalise;
      default:
        return 'PENDENTE';
    }
  }

  private statusNormalizado(status?: string): string {
    return (status ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private async obterImagensEdicaoComoArquivos(): Promise<File[]> {
    const arquivos = await Promise.all(
      this.imagensEdicao.map((imagem, indice) => this.obterImagemEdicaoComoArquivo(imagem, indice))
    );

    if (!arquivos.length || arquivos.length > 3) {
      throw new Error('Quantidade de imagens invalida.');
    }

    return arquivos;
  }

  private async obterImagemEdicaoComoArquivo(imagem: ImagemEdicao, indice: number): Promise<File> {
    if (imagem.arquivo) {
      return imagem.arquivo;
    }

    const url = imagem.preview;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar imagem atual.');
    }

    const blob = await resposta.blob();
    const extensao = blob.type.split('/')[1] || 'jpg';

    return new File([blob], `doacao-${this.doacao.id}-${indice + 1}.${extensao}`, {
      type: blob.type || 'image/jpeg'
    });
  }

  private rejeitarImagem(input: HTMLInputElement, mensagem: string): void {
    input.value = '';
    this.erroImagem = mensagem;
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

  private abrirModalCarregamento(titulo: string, mensagem: string) {
    return this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo,
        mensagem,
        mostrarConfirmar: false,
        carregando: true
      }
    });
  }

}
