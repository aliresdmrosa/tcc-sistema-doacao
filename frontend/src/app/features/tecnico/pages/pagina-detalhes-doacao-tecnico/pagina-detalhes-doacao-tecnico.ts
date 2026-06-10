import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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

type StatusDoacaoTecnico = 'PENDENTE' | 'REPARO' | 'APROVADO_REPARO' | 'APROVADO' | 'REPROVADO' | 'APROVADA' | 'REPROVADA' | 'ESTOQUE' | 'EM_ESTOQUE' | 'VINCULADO' | 'VINCULADA' | 'DOADO' | 'ENTREGUE' | 'DESCARTE';

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

  idDoacao = this.route.snapshot.paramMap.get('id');
  doacao?: DoacaoDTO;
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


  private get statusNormalizado(): StatusDoacaoTecnico | undefined {
    return this.doacao?.status?.toUpperCase() as StatusDoacaoTecnico | undefined;
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
    if (!this.podeAprovar || !this.doacao) {
      this.exibirMensagem('Esta doacao nao pode ser aprovada neste status.');
      return;
    }

    this.executarAposConfirmacao(
      'Aprovar doação?',
      'Confirme para alterar o status desta doação para aprovada.',
      () => {
        if (!this.doacao) {
          return;
        }

        this.doacaoService.aprovarDoacao(this.doacao.id, '').subscribe({
          next: () => this.router.navigate(['/tecnico/doacoes']),
          error: (error) => console.error('Erro ao aprovar a doacao:', error)
        });
      }
    );
  }

  reprovar(): void {
    if (!this.podeReprovar || !this.doacao) {
      this.exibirMensagem('Esta doacao nao pode ser reprovada neste status.');
      return;
    }

    this.executarAposConfirmacao(
      'Reprovar doacao?',
      'Confirme para alterar o status desta doacao para reprovada.',
      () => {
        if (!this.doacao) {
          return;
        }

        this.doacaoService.reprovarDoacao(this.doacao.id, '').subscribe({
          next: () => this.router.navigate(['/tecnico/doacoes']),
          error: (error) => console.error('Erro ao reprovar a doacao:', error)
        });
      }
    );
  }

  enviarParaReparo(): void {
    if (!this.podeMarcarReparo) {
      return;
    }

    console.log('Enviar para reparo:', this.doacao?.id);
    this.router.navigate(['/tecnico/doacoes', this.doacao?.id, 'reparo']);
  }

  aprovarParaReparo(): void {
    if (!this.podeAprovarParaReparo || !this.doacao) {
      this.exibirMensagem('Carregue a doacao antes de aprovar para reparo.');
      return;
    }

    this.confirmarAlteracaoStatus(
      'Aprovar para reparo?',
      'Confirme para alterar o status desta doacao para aprovado_reparo.',
      'APROVADO_REPARO',
      'Doacao aprovada para reparo com sucesso!'
    );
  }

  entregar(): void {
    if (!this.podeMarcarEntregue || !this.doacao) {
      this.exibirMensagem('A doacao so pode ser entregue quando estiver aprovada.');
      return;
    }

    this.confirmarAlteracaoStatus(
      'Marcar como entregue?',
      'Confirme que o equipamento foi entregue.',
      'ENTREGUE',
      'Doacao marcada como entregue!'
    );
  }

  descartar(): void {
    const ultimoReparo = this.obterUltimoReparo();

    if (!this.podeDescartar) {
      this.exibirMensagem('Esta doacao nao pode ser enviada para descarte neste status.');
      return;
    }

    if (!ultimoReparo) {
      this.exibirMensagem('E necessario existir um reparo para enviar a doacao para descarte.');
      return;
    }

    this.executarAposConfirmacao(
      'Enviar para descarte?',
      'Confirme para alterar o status desta doacao para descarte.',
      () => {
        this.reparoService.concluirReparoDescarte(ultimoReparo.id, 'Doacao enviada para descarte').subscribe({
          next: () => this.finalizarAlteracaoStatus('DESCARTE', 'Doacao enviada para descarte!'),
          error: (error) => {
            console.error('Erro ao enviar doacao para descarte:', error);
            this.exibirMensagem('Nao foi possivel enviar a doacao para descarte.');
          }
        });
      }
    );
  }

  reabrirAnalise(): void {
    if (!this.podeReabrirAnalise || !this.doacao) {
      this.exibirMensagem('Carregue a doacao antes de reabrir a analise.');
      return;
    }

    this.executarAposConfirmacao(
      'Reabrir analise?',
      'Confirme para voltar esta doacao para pendente.',
      () => this.finalizarAlteracaoStatus('PENDENTE', 'Analise reaberta com sucesso!')
    );
  }

  deletar(): void {
    if (!this.doacao) {
      return;
    }
  }

  private confirmarAlteracaoStatus(
    titulo: string,
    mensagem: string,
    status: StatusDoacaoTecnico,
    mensagemSucesso: string
  ): void {
    this.executarAposConfirmacao(titulo, mensagem, () => {
      if (!this.doacao) {
        return;
      }

      const requisicao = this.obterRequisicaoAlteracaoStatus(this.doacao.id, status, mensagemSucesso);

      if (!requisicao) {
        this.finalizarAlteracaoStatus(status, mensagemSucesso);
        return;
      }

      requisicao.subscribe({
        next: () => this.finalizarAlteracaoStatus(status, mensagemSucesso),
        error: (error: unknown) => {
          console.error('Erro ao alterar status da doacao:', error);
          this.exibirMensagem('Nao foi possivel alterar o status da doacao.');
        }
      });
    });
  }

  private executarAposConfirmacao(titulo: string, mensagem: string, acao: () => void): void {
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
      if (confirmou) {
        acao();
      }
    });
  }

  private exibirMensagem(mensagem: string, duration = 3500): void {
    this.snackBar.open(mensagem, 'Fechar', { duration });
  }

  private obterRequisicaoAlteracaoStatus(id: number, status: StatusDoacaoTecnico, motivo: string) {
    switch (status) {
      case 'APROVADO_REPARO':
        return this.doacaoService.aprovarDoacaoParaReparo(id, motivo);
      case 'ENTREGUE':
        return this.doacaoService.entregarDoacao(id, motivo);
      default:
        return null;
    }
  }

  private finalizarAlteracaoStatus(status: StatusDoacaoTecnico, mensagem: string): void {
    if (this.doacao) {
      this.doacao = {
        ...this.doacao,
        status
      };
    }

    this.exibirMensagem(mensagem, 3000);
  }

  private obterUltimoReparo(): ReparoHistorico | undefined {
    return this.reparos[this.reparos.length - 1];
  }

  obterClasseStatus(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
      case 'APROVADO_REPARO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'REPARO':
      case 'EM_ANALISE':
        return 'status-analise';
      case 'PENDENTE':
        return 'status-pendente';
      case 'EM_ESTOQUE':
      case 'ESTOQUE':
      case 'VINCULADA':
      case 'VINCULADO':
      case 'DOADO':
      case 'ENTREGUE':
        return 'status-entregue';
      case 'DESCARTE':
        return 'status-reprovado';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'Aprovada';
      case 'APROVADO_REPARO':
        return 'aprovado_reparo';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'Reprovada';
      case 'REPARO':
        return 'Reparo';
      case 'EM_ANALISE':
        return 'Em análise';
      case 'PENDENTE':
        return 'Pendente';
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
      default:
        return status ?? 'Status desconhecido';
    }
  }
}
