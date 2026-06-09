import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { SolicitacaoService } from '../../../../core/services/solicitacao.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

type TipoEquipamento = 'COMPUTADOR' | 'NOTEBOOK' | 'MONITOR' | 'TECLADO' | 'MOUSE';

interface EquipamentoDisponivel {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  imagem: string;
  status: 'EM_ESTOQUE' | 'VINCULADO';
}

@Component({
  selector: 'app-pagina-atribuir-equipamento',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-atribuir-equipamento.html',
  styleUrls: ['./pagina-atribuir-equipamento.css']
})
export class PaginaAtribuirEquipamentoComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private doacaoService: DoacaoService,
    private solicitacaoService: SolicitacaoService
  ) {
    this.solicitacaoId = this.route.snapshot.queryParamMap.get('solicitacaoId');
    const tipo = this.route.snapshot.queryParamMap.get('tipo');

    if (this.ehTipoEquipamento(tipo)) {
      this.tipoSelecionado = tipo;
    }
  }

  solicitacaoId: string | null = null;
  tipoSelecionado: TipoEquipamento = 'COMPUTADOR';
  equipamentoSelecionadoId: string | null = null;
  carregando = false;

  tiposEquipamento: { valor: TipoEquipamento; label: string }[] = [
    { valor: 'COMPUTADOR', label: 'Computador' },
    { valor: 'NOTEBOOK', label: 'Notebook' },
    { valor: 'MONITOR', label: 'Monitor' },
    { valor: 'TECLADO', label: 'Teclado' },
    { valor: 'MOUSE', label: 'Mouse' }
  ];

  equipamentos: EquipamentoDisponivel[] = [
    {
      id: '001',
      nome: 'Computador',
      descricao: 'Computador completo em bom estado',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    },
    {
      id: '002',
      nome: 'Computador',
      descricao: 'Computador completo em bom estado',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    },
    {
      id: '003',
      nome: 'Notebook Dell',
      descricao: 'Notebook em bom estado para atividades acadêmicas',
      tipo: 'NOTEBOOK',
      imagem: 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    },
    {
      id: '004',
      nome: 'Monitor LG',
      descricao: 'Monitor novo disponível para atribuição',
      tipo: 'MONITOR',
      imagem: 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    },
    {
      id: '005',
      nome: 'Teclado Logitech',
      descricao: 'Teclado precisa de reparo antes da entrega',
      tipo: 'TECLADO',
      imagem: 'https://placehold.co/160x100',
      status: 'VINCULADO'
    },
    {
      id: '006',
      nome: 'Mouse USB',
      descricao: 'Mouse usado em bom estado',
      tipo: 'MOUSE',
      imagem: 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    }
  ];

  get equipamentosFiltrados(): EquipamentoDisponivel[] {
    return this.equipamentos.filter(
      (equipamento) => equipamento.tipo === this.tipoSelecionado && equipamento.status === 'EM_ESTOQUE'
    );
  }

  get temEquipamentoSelecionado(): boolean {
    return this.equipamentoSelecionadoId !== null;
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.carregarEquipamentosEmEstoque();
  }

  carregarEquipamentosEmEstoque(): void {
    this.carregando = true;
    this.equipamentos = [];

    this.doacaoService.listarDoacoesPorStatus('ESTOQUE').subscribe({
      next: (doacoes) => {
        this.equipamentos = doacoes.map((doacao) => this.mapearDoacaoParaEquipamento(doacao));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar equipamentos em estoque:', erro);
        this.equipamentos = [];
        this.carregando = false;
        this.snackBar.open('Nao foi possivel carregar os equipamentos em estoque.', 'Fechar', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  selecionarEquipamento(equipamento: EquipamentoDisponivel): void {
    if (this.temEquipamentoSelecionado) {
      this.snackBar.open('Cancele a seleção atual antes de escolher outro equipamento.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Selecionar equipamento?',
        mensagem: `Tem certeza que deseja selecionar o equipamento ${equipamento.nome}?`,
        textoConfirmar: 'Selecionar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      const solicitacaoId = Number(this.solicitacaoId);
      const doacaoId = Number(equipamento.id);

      if (!solicitacaoId || !doacaoId) {
        this.snackBar.open('Nao foi possivel identificar a solicitacao ou a doacao.', 'Fechar', { duration: 3000 });
        return;
      }

      this.solicitacaoService.vincularDoacaoSolicitacao(solicitacaoId, doacaoId).subscribe({
        next: () => {
          this.equipamentoSelecionadoId = equipamento.id;
          equipamento.status = 'VINCULADO';
          this.salvarEquipamentoAtribuido(equipamento);
          this.cdr.detectChanges();
          this.snackBar.open('Equipamento vinculado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (erro) => {
          console.error('Erro ao vincular equipamento:', erro);
          this.snackBar.open('Nao foi possivel vincular o equipamento a solicitacao.', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  cancelarSelecao(equipamento: EquipamentoDisponivel): void {
    if (!this.equipamentoEstaSelecionado(equipamento)) {
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Cancelar seleção?',
        mensagem: `Deseja cancelar a seleção do equipamento ${equipamento.nome}?`,
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Voltar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.equipamentoSelecionadoId = null;
      equipamento.status = 'EM_ESTOQUE';
      this.limparEquipamentoAtribuido();
      this.cdr.detectChanges();
      this.snackBar.open('Seleção cancelada com sucesso!', 'Fechar', { duration: 3000 });
    });
  }

  equipamentoEstaSelecionado(equipamento: EquipamentoDisponivel): boolean {
    return this.equipamentoSelecionadoId === equipamento.id;
  }

  private ehTipoEquipamento(tipo: string | null): tipo is TipoEquipamento {
    return this.tiposEquipamento.some((equipamento) => equipamento.valor === tipo);
  }

  private mapearDoacaoParaEquipamento(doacao: DoacaoDTO): EquipamentoDisponivel {
    const equipamento = doacao.equipamento ?? null;
    const tipo: TipoEquipamento = this.ehTipoEquipamento(equipamento) ? equipamento : 'COMPUTADOR';

    return {
      id: String(doacao.id),
      nome: doacao.equipamento ?? 'Equipamento',
      descricao: doacao.descricao ?? 'Sem descricao cadastrada.',
      tipo,
      imagem: this.montarImagemUrl(doacao.imagens?.[0]?.url ?? doacao.url) ?? 'https://placehold.co/160x100',
      status: 'EM_ESTOQUE'
    };
  }

  private montarImagemUrl(imagem?: string): string | null {
    if (!imagem?.trim()) {
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

  private salvarEquipamentoAtribuido(equipamento: EquipamentoDisponivel): void {
    if (!this.solicitacaoId || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      `solicitacao:${this.solicitacaoId}:equipamentoAtribuido`,
      JSON.stringify({
        id: equipamento.id,
        nome: equipamento.nome,
        status: 'VINCULADA'
      })
    );

    localStorage.setItem(`solicitacao:${this.solicitacaoId}:status`, 'VINCULADA');
  }

  private limparEquipamentoAtribuido(): void {
    if (!this.solicitacaoId || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(`solicitacao:${this.solicitacaoId}:equipamentoAtribuido`);
    localStorage.removeItem(`solicitacao:${this.solicitacaoId}:status`);
  }

  voltar(): void {
    history.back();
  }
}
