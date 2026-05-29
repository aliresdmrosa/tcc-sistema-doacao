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
type EstadoConservacao = 'NOVO' | 'USADO' | 'REPARO';

interface EquipamentoDisponivel {
  id: string;
  nome: string;
  descricao: string;
  estado: EstadoConservacao;
  tipo: TipoEquipamento;
  imagem: string;
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
  }

  solicitacaoId: string | null = null;
  estadoSelecionado: EstadoConservacao = 'USADO';
  tipoSelecionado: TipoEquipamento = 'COMPUTADOR';
  equipamentoSelecionadoId: string | null = null;

  estadosConservacao: { valor: EstadoConservacao; label: string }[] = [
    { valor: 'NOVO', label: 'Novo' },
    { valor: 'USADO', label: 'Usado' },
    { valor: 'REPARO', label: 'Precisa de reparo' }
  ];

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
      nome: 'Computador HP',
      descricao: 'Computador completo em bom estado',
      estado: 'USADO',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '002',
      nome: 'Computador HP',
      descricao: 'Computador completo em bom estado',
      estado: 'USADO',
      tipo: 'COMPUTADOR',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '003',
      nome: 'Notebook Dell',
      descricao: 'Notebook em bom estado para atividades academicas',
      estado: 'USADO',
      tipo: 'NOTEBOOK',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '004',
      nome: 'Monitor LG',
      descricao: 'Monitor novo disponivel para atribuicao',
      estado: 'NOVO',
      tipo: 'MONITOR',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '005',
      nome: 'Teclado Logitech',
      descricao: 'Teclado precisa de reparo antes da entrega',
      estado: 'REPARO',
      tipo: 'TECLADO',
      imagem: 'https://placehold.co/160x100'
    },
    {
      id: '006',
      nome: 'Mouse USB',
      descricao: 'Mouse usado em bom estado',
      estado: 'USADO',
      tipo: 'MOUSE',
      imagem: 'https://placehold.co/160x100'
    }
  ];

  get equipamentosFiltrados(): EquipamentoDisponivel[] {
    return this.equipamentos.filter((equipamento) =>
      equipamento.estado === this.estadoSelecionado &&
      equipamento.tipo === this.tipoSelecionado
    );
  }

  get temEquipamentoSelecionado(): boolean {
    return this.equipamentoSelecionadoId !== null;
  }

  ngAfterViewInit(): void {
  }

  selecionarEquipamento(equipamento: EquipamentoDisponivel): void {
    if (this.temEquipamentoSelecionado) {
      this.snackBar.open('Cancele a selecao atual antes de escolher outro equipamento.', 'Fechar', { duration: 3000 });
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
        titulo: 'Cancelar selecao?',
        mensagem: `Deseja cancelar a selecao do equipamento ${equipamento.nome}?`,
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
      this.limparEquipamentoAtribuido();
      this.cdr.detectChanges();
      this.snackBar.open('Selecao cancelada com sucesso!', 'Fechar', { duration: 3000 });
    });
  }

  equipamentoEstaSelecionado(equipamento: EquipamentoDisponivel): boolean {
    return this.equipamentoSelecionadoId === equipamento.id;
  }

  obterTextoEstado(estado: EstadoConservacao): string {
    const item = this.estadosConservacao.find((opcao) => opcao.valor === estado);
    return item?.label ?? estado;
  }

  private salvarEquipamentoAtribuido(equipamento: EquipamentoDisponivel): void {
    if (!this.solicitacaoId || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      `solicitacao:${this.solicitacaoId}:equipamentoAtribuido`,
      JSON.stringify({
        id: equipamento.id,
        nome: equipamento.nome
      })
    );
  }

  private limparEquipamentoAtribuido(): void {
    if (!this.solicitacaoId || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(`solicitacao:${this.solicitacaoId}:equipamentoAtribuido`);
  }

  voltar(): void {
    history.back();
  }
}
