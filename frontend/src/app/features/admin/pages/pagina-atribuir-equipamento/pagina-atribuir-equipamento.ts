import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
export class PaginaAtribuirEquipamentoComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
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

      this.equipamentoSelecionadoId = equipamento.id;
      equipamento.status = 'VINCULADO';
      this.salvarEquipamentoAtribuido(equipamento);
      this.cdr.detectChanges();
      console.log('Equipamento selecionado:', equipamento);
      this.snackBar.open('Equipamento selecionado com sucesso!', 'Fechar', { duration: 3000 });

      // chamada api
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
