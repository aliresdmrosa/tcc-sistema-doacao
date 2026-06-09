import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CURSOS } from '../../../../shared/utils/form-validations';

type StatusSolicitacao = 'PENDENTE' | 'REPARO' | 'EM_ANALISE' | 'APROVADA' | 'APROVADO' | 'REPROVADA' | 'REPROVADO' | 'VINCULADA' | 'DOADO';

@Component({
  selector: 'app-pagina-detalhes-solicitacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './pagina-detalhes-solicitacao.html',
  styleUrl: './pagina-detalhes-solicitacao.css'
})
export class PaginaDetalhesSolicitacao {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  idSolicitacao = this.route.snapshot.paramMap.get('id') ?? '001';
  private solicitacaoNavegacao = typeof history !== 'undefined' ? history.state?.solicitacao : null;
  cursos = CURSOS;
  tiposEquipamento = [
    { valor: 'COMPUTADOR', label: 'Computador' },
    { valor: 'NOTEBOOK', label: 'Notebook' },
    { valor: 'MONITOR', label: 'Monitor' },
    { valor: 'TECLADO', label: 'Teclado' },
    { valor: 'MOUSE', label: 'Mouse' }
  ];

  solicitacao = {
    id: this.idSolicitacao,
    equipamento: this.solicitacaoNavegacao?.equipamento ?? 'COMPUTADOR',
    curso: this.solicitacaoNavegacao?.curso ?? 'TADS',
    grr: this.solicitacaoNavegacao?.grr ?? '20202020',
    motivo: this.solicitacaoNavegacao?.motivo ?? this.solicitacaoNavegacao?.justificativa ?? 'Sou estudante e preciso de um computador para acompanhar as atividades acadêmicas.',
    semComputador: this.solicitacaoNavegacao?.semComputador ?? true,
    matriculaAtiva: this.solicitacaoNavegacao?.matriculaAtiva ?? true,
    status: (this.solicitacaoNavegacao?.status ?? 'PENDENTE') as StatusSolicitacao,
    dataCadastro: this.solicitacaoNavegacao?.dataCadastro ?? '2025-05-01',
    dataUltimaModificacao: this.solicitacaoNavegacao?.ultimaAtualizacao
      ?? this.solicitacaoNavegacao?.dataUltimaAtualizacao
      ?? this.solicitacaoNavegacao?.dataAlteracao
      ?? '2025-05-01'
  };

  form = this.fb.group({
    equipamento: [{ value: this.solicitacao.equipamento, disabled: true }],
    curso: [{ value: this.solicitacao.curso, disabled: true }],
    grr: [{ value: this.solicitacao.grr, disabled: true }],
    motivo: [{ value: this.solicitacao.motivo, disabled: true }],
    semComputador: [{ value: this.solicitacao.semComputador, disabled: true }],
    matriculaAtiva: [{ value: this.solicitacao.matriculaAtiva, disabled: true }]
  });

  voltar(): void {
    this.router.navigate(['/usuario/listar-solicitacoes']);
  }

  obterClasseStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'REPARO':
      case 'EM_ANALISE':
        return 'status-analise';
      case 'PENDENTE':
        return 'status-pendente';
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'Aprovada';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'Reprovada';
      case 'REPARO':
        return 'Reparo';
      case 'EM_ANALISE':
        return 'Em análise';
      case 'PENDENTE':
        return 'Pendente';
      case 'VINCULADA':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      default:
        return status;
    }
  }

  get solicitacaoReprovada(): boolean {
    const status = this.normalizarStatus(this.solicitacao.status);
    return status === 'REPROVADA' || status === 'REPROVADO';
  }

  private normalizarStatus(status: string): string {
    return status
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

}
