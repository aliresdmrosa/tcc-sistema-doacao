import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

type StatusAnalise = 'PENDENTE' | 'REPARO' | 'APROVADO_REPARO' | 'APROVADO' | 'REPROVADO' | 'APROVADA' | 'REPROVADA' | 'ESTOQUE' | 'EM_ESTOQUE' | 'VINCULADO' | 'VINCULADA' | 'DOADO' | 'ENTREGUE' | 'DESCARTE';

interface ReparoHistorico {
  id: number;
  dataFim?: string | null;
}


@Component({
  selector: 'app-pagina-detalhes-doacao-tecnico',
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
  templateUrl: './pagina-detalhes-doacao-tecnico.html',
  styleUrls: ['./pagina-detalhes-doacao-tecnico.css']
})

export class PaginaDetalhesDoacaoTecnico implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private doacaoService = inject(DoacaoService);
  private reparoService = inject(ReparoService);
  acaoEmAndamento = false;

  idDoacao = this.route.snapshot.paramMap.get('id');
  doacao!: DoacaoDTO;
  imagens: string[] = [];
  reparos: ReparoHistorico[] = [];
  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];


  form = this.fb.group({
    nome: [{ value: '', disabled: true }],
    cpf: [{ value: '', disabled: true }],
    equipamento: [{ value: '', disabled: true }],
    descricao: [{ value: '', disabled: true }],
    imagem: [{ value: '', disabled: true }],
    estadoConservacao: [{ value: '', disabled: true }]
  });

  ngOnInit(): void {
    this.carregarDoacaoDaApi();
  }


  get podeAprovar(): boolean {
    return this.statusNormalizado === 'PENDENTE';
  }

  get podeReprovar(): boolean {
    return this.statusNormalizado === 'PENDENTE';
  }

  get podeMarcarReparo(): boolean {
    return this.statusNormalizado === 'APROVADO_REPARO' || this.statusNormalizado === 'PENDENTE';
  }

  get podeAprovarParaReparo(): boolean {
    return this.podeMarcarReparo;
  }

  get podeConcluirAnalise(): boolean {
    return this.podeAprovar;
  }

  get podeMarcarEntregue(): boolean {
    return this.statusNormalizado === 'APROVADO';
  }

  get podeReabrirAnalise(): boolean {
    return !!this.doacao;
  }

  get deveExibirReabrirAnalise(): boolean {
    return this.podeReabrirAnalise;
  }

  get podeDescartar(): boolean {
    const status = this.statusNormalizado;
    return status === 'REPARO';
  }


  private get statusNormalizado(): StatusAnalise | undefined {
    return this.doacao?.status?.toUpperCase() as StatusAnalise | undefined;
  }

  carregarDoacaoDaApi(): void {
    this.doacaoService.doacaoId(Number(this.idDoacao)).subscribe({
      next: (doacao) => {
        this.doacao = doacao;
        this.form.patchValue({
          nome: doacao.nome ?? '',
          cpf: doacao.cpf ?? '',
          equipamento: doacao.equipamento ?? '',
          descricao: doacao.descricao ?? '',
          estadoConservacao: doacao.statusConservacao ?? ''
        });
        this.doacao.id = doacao.id
        console.log(doacao);
        this.imagens = doacao.imagens?.map(
          imagem => `http://localhost:8080${imagem.url}`
        ) ?? [];
        console.log('Doacao carregada:', doacao);
        this.carregarReparosDaDoacao();
      },
      error: (error) => {
        console.error('Erro ao carregar os detalhes da doacao:', error);
      }
    });
  }

  carregarReparosDaDoacao(): void {
    const id = Number(this.idDoacao);

    if (!Number.isFinite(id)) {
      return;
    }

    this.reparoService.listarReparosDoacao(id).subscribe({
      next: (reparos) => {
        this.reparos = reparos;
      },
      error: (error) => {
        console.error('Erro ao carregar reparos da doacao:', error);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  editar(): void {
    
  }

  aprovar(): void {
    this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Aprovar doacao?',
    mensagemConfirmacao: 'Confirme para alterar o status desta doacao para aprovada.',
    tituloCarregamento: 'Doacao aprovada',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Sucesso',
    mensagemSucesso: 'A doacao esta com status aprovada.',
    mensagemErro: 'Nao foi possivel alterar o status da doacao para aprovada.',
    requisicao: (id) => this.doacaoService.aprovarDoacao(
      id,
      'Doacao aprovada pelo tecnico.'
    )
  });
  }

   reprovar(): void {
    this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Reprovar doacao?',
    mensagemConfirmacao: 'Confirme para alterar o status desta doacao para reprovada.',
    tituloCarregamento: 'Doacao reprovada',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Sucesso',
    mensagemSucesso: 'A doacao esta com status reprovada.',
    mensagemErro: 'Nao foi possivel alterar o status da doacao para reprovada.',
    requisicao: (id) => this.doacaoService.reprovarDoacao(
      id,
      'Doacao reprovada pelo tecnico.'
    )
  });
  }

  enviarParaReparo(): void {
    
    console.log('Enviar para reparo:', this.doacao?.id);
    this.router.navigate(['/tecnico/doacoes', this.doacao?.id, 'reparo']);
  }

 

  entregar(): void {
    this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Entregar doacao?',
    mensagemConfirmacao: 'Confirme para alterar o status desta doacao para entregue.',
    tituloCarregamento: 'Doacao entregue',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Sucesso',
    mensagemSucesso: 'A doacao esta com status entregue.',
    mensagemErro: 'Nao foi possivel alterar o status da doacao para entregue.',
    requisicao: (id) => this.doacaoService.entregarDoacao(
      id,
      'Doacao entregue pelo tecnico.'
    )
  });
  }

  descartar(): void {
    this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Alterar status da doação para Reciclagem?',
    mensagemConfirmacao: 'Confirme para alterar o status desta doacao para reciclagem.',
    tituloCarregamento: 'Doacao reciclada',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Sucesso',
    mensagemSucesso: 'A doacao esta com status reciclagem.',
    mensagemErro: 'Nao foi possivel alterar o status da doacao para reciclagem.',
    requisicao: (id) => this.doacaoService.enviarDoacaoReciclagem(

      id,
      'Doacao aprovada pelo tecnico.'
    )
  })
  }

  reabrirAnalise(): void {
  this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Reabrir analise?',
    mensagemConfirmacao: 'Confirme para alterar o status desta doacao para pendente.',
    tituloCarregamento: 'Reabrindo analise',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Analise reaberta',
    mensagemSucesso: 'A doacao voltou para o status pendente.',
    mensagemErro: 'Nao foi possivel alterar o status da doacao para pendente.',
    requisicao: (id) => this.doacaoService.enviarDoacaoParaPendente(
      id,
      'Analise reaberta pelo tecnico.'
    )
  });
}

  deletar(): void {
  this.confirmarAlteracaoStatusDireta({
    tituloConfirmacao: 'Deletar doacao?',
    mensagemConfirmacao: 'Confirme para deletar doacao.',
    tituloCarregamento: 'Deletando doação',
    mensagemCarregamento: 'Aguarde enquanto o status da doacao e atualizado.',
    tituloSucesso: 'Analise reaberta',
    mensagemSucesso: 'A doacao deletada.',
    mensagemErro: 'Nao foi possivel deletar doacao.',
    requisicao: (id) => this.doacaoService.deletarDoacao(
      id,
    )
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

  

}
