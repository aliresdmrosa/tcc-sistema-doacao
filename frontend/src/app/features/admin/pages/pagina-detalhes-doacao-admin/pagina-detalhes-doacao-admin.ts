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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { ReparoService } from '../../../../core/services/reparo.service';
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
  | 'DESCARTE';

interface DetalhesDoacaoAdmin {
  id: string;
  nomeDoador: string;
  cpf: string;
  tipoItem: string;
  descricao: string;
  imagem: string;
  estadoConservacao: string;
  status: StatusAnalise;
  dataCadastro: string;
  dataUltimaModificacao: string;
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
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-detalhes-doacao-admin.html',
  styleUrls: ['./pagina-detalhes-doacao-admin.css']
})
export class PaginaDetalhesDoacaoAdmin implements OnInit {
marcarComoAprovadoReparo() {
throw new Error('Method not implemented.');
}
marcarComoDoado() {
throw new Error('Method not implemented.');
}
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private doacaoService = inject(DoacaoService);
  private reparoService = inject(ReparoService);
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
    estadoConservacao: '',
    status: 'PENDENTE',
    dataCadastro: '',
    dataUltimaModificacao: ''
  };

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

  get podeReabrirAnalise(): boolean {
    return this.statusNormalizado(this.doacao.status) !== 'PENDENTE';
  }

  get podeMarcarEmEstoque(): boolean {
    const status = this.statusNormalizado(this.doacao.status);
    return status === 'APROVADO' || status === 'APROVADO_REPARO' || status === 'REPARO';
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

  carregarDoacaoDaApi(): void {
    const id = Number(this.idDoacao);

    if (!id) {
      this.snackBar.open('Doacao nao encontrada.', 'Fechar', { duration: 3000 });
      this.voltar();
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
        this.snackBar.open('Erro ao carregar doacao.', 'Fechar', { duration: 3000 });
        this.voltar();
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
      this.snackBar.open('CPF do doador nao encontrado.', 'Fechar', { duration: 3000 });
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
        this.snackBar.open('Doador nao encontrado pelo CPF.', 'Fechar', { duration: 3000 });
      }
    });
  }

  editar(): void {
    this.dadosAntesDaEdicao = { ...this.doacao };
    this.modoEdicao = true;
    this.form.get('tipoItem')?.enable();
    this.form.get('descricao')?.enable();
    this.form.get('estadoConservacao')?.enable();
  }

  salvarEdicao(): void {
    const dados = this.form.getRawValue();
    const id = Number(this.doacao.id);

    if (!id) {
      this.snackBar.open('Doacao nao encontrada.', 'Fechar', { duration: 3000 });
      return;
    }

    if (!this.imagemUrl) {
      this.snackBar.open('Nao foi possivel atualizar: a API exige uma imagem.', 'Fechar', {
        duration: 4000
      });
      return;
    }

    this.acaoEmAndamento = true;
    this.obterImagemAtualComoArquivo()
      .then((imagem) => {
        this.doacaoService.atualizarDoacao(id, {
          equipamento: dados.tipoItem ?? '',
          descricao: dados.descricao ?? '',
          conservacao: dados.estadoConservacao ?? '',
          imagem
        }).subscribe({
          next: () => {
            this.acaoEmAndamento = false;
            this.modoEdicao = false;
            this.form.disable();
            this.snackBar.open('Doacao atualizada com sucesso!', 'Fechar', { duration: 3000 });
            this.carregarDoacaoDaApi();
          },
          error: (erro) => {
            console.error('Erro ao atualizar doacao:', erro);
            this.acaoEmAndamento = false;
            this.snackBar.open('Erro ao atualizar doacao.', 'Fechar', { duration: 3000 });
          }
        });
      })
      .catch((erro) => {
        console.error('Erro ao carregar imagem atual:', erro);
        this.acaoEmAndamento = false;
        this.snackBar.open('Nao foi possivel carregar a imagem atual para atualizar.', 'Fechar', {
          duration: 4000
        });
      });
  }

  cancelarEdicao(): void {
    if (this.dadosAntesDaEdicao) {
      this.doacao = { ...this.dadosAntesDaEdicao };
      this.preencherFormulario();
    }

    this.modoEdicao = false;
    this.form.disable();
  }

  marcarReparo(): void {
    if (!this.podeMarcarReparo) {
      this.snackBar.open('A doacao so pode ser marcada como reparo quando esta pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Enviar para reparo?',
        mensagem: 'Confirme para criar um reparo e alterar o status desta doacao.',
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
      this.reparoService.salvarReparo(Number(this.doacao.id), 'Doacao enviada para reparo pelo administrador.').subscribe({
        next: () => {
          this.acaoEmAndamento = false;
          this.snackBar.open('Doacao marcada como reparo.', 'Fechar', { duration: 3000 });
          this.carregarDoacaoDaApi();
        },
        error: (erro) => {
          console.error('Erro ao criar reparo:', erro);
          this.acaoEmAndamento = false;
          this.snackBar.open('Erro ao marcar doacao como reparo.', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  marcarEmEstoque(): void {
    if (!this.podeMarcarEmEstoque) {
      this.snackBar.open('A doacao so pode ir para estoque depois de aprovada.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Mover para estoque?',
        mensagem: 'Confirme para concluir o reparo aberto e mover a doacao para estoque.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.concluirReparoAbertoComoEstoque();
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

  reabrirAnalise(): void {
    if (!this.podeReabrirAnalise) {
      this.snackBar.open('A analise so pode ser reaberta quando a doacao nao esta pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    this.snackBar.open('Nao existe endpoint para reabrir analise nesta tela.', 'Fechar', {
      duration: 3500
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
          this.snackBar.open('Doacao excluida com sucesso!', 'Fechar', { duration: 3000 });
          this.voltar();
        },
        error: (erro) => {
          console.error('Erro ao deletar doacao:', erro);
          this.snackBar.open('Erro ao deletar doacao.', 'Fechar', { duration: 3000 });
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
      case 'APROVADO_REPARO':
        return 'Aprovada';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'Reprovada';
      case 'REPARO':
        return 'Reparo';
      case 'EM_ESTOQUE':
      case 'ESTOQUE':
        return 'Em estoque';
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

  private alterarStatus(status: StatusAnalise, mensagem: string): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta acao so pode ser feita quando a doacao esta pendente ou em reparo.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const id = Number(this.doacao.id);
    const requisicao =
      this.statusNormalizado(status) === 'APROVADO'
        ? this.doacaoService.aprovarDoacao(id, mensagem)
        : this.doacaoService.reprovarDoacao(id, mensagem);

    this.acaoEmAndamento = true;

    requisicao.subscribe({
      next: () => {
        this.acaoEmAndamento = false;
        this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
        this.carregarDoacaoDaApi();
      },
      error: (erro) => {
        console.error('Erro ao alterar status da doacao:', erro);
        this.acaoEmAndamento = false;
        this.snackBar.open('Erro ao alterar status da doacao.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private confirmarAlteracaoStatus(
    titulo: string,
    mensagem: string,
    status: StatusAnalise,
    mensagemSucesso: string
  ): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta acao so pode ser feita quando a doacao esta pendente ou em reparo.', 'Fechar', {
        duration: 3500
      });
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

    return {
      id: String(doacao.id),
      nomeDoador: doacao.nome ?? '',
      cpf: doacao.cpf ?? '',
      tipoItem: doacao.equipamento ?? '',
      descricao: doacao.descricao ?? '',
      imagem: primeiraImagem,
      estadoConservacao: doacao.statusConservacao ?? '',
      status: this.converterStatus(doacao.status),
      dataCadastro: this.formatarData(doacao.dataCadastro),
      dataUltimaModificacao: this.formatarData(doacao.dataAlteracaoStatus ?? doacao.dataCadastro)
    };
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

  private formatarData(data?: string): string {
    if (!data) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split('-').map(Number);
      return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return data;
    }

    return dataConvertida.toLocaleDateString('pt-BR');
  }

  private async obterImagemAtualComoArquivo(): Promise<File> {
    const url = this.imagemUrl;

    if (!url) {
      throw new Error('Imagem atual nao encontrada.');
    }

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar imagem atual.');
    }

    const blob = await resposta.blob();
    const extensao = blob.type.split('/')[1] || 'jpg';

    return new File([blob], `doacao-${this.doacao.id}.${extensao}`, {
      type: blob.type || 'image/jpeg'
    });
  }

  private concluirReparoAbertoComoEstoque(): void {
    this.acaoEmAndamento = true;

    this.reparoService.listarReparosDoacao(Number(this.doacao.id)).subscribe({
      next: (reparos) => {
        const reparoAberto = [...reparos]
          .reverse()
          .find((reparo) => !reparo.dataFim);

        if (!reparoAberto) {
          this.acaoEmAndamento = false;
          this.snackBar.open('Nao existe reparo aberto para concluir esta doacao.', 'Fechar', {
            duration: 4000
          });
          return;
        }

        this.reparoService.concluirReparo(reparoAberto.id, 'Reparo concluido pelo administrador.').subscribe({
          next: () => {
            this.acaoEmAndamento = false;
            this.snackBar.open('Doacao movida para estoque.', 'Fechar', { duration: 3000 });
            this.carregarDoacaoDaApi();
          },
          error: (erro) => {
            console.error('Erro ao concluir reparo:', erro);
            this.acaoEmAndamento = false;
            this.snackBar.open('Erro ao mover doacao para estoque.', 'Fechar', { duration: 3000 });
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao listar reparos da doacao:', erro);
        this.acaoEmAndamento = false;
        this.snackBar.open('Erro ao buscar reparos da doacao.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
