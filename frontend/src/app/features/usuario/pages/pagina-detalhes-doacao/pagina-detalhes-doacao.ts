import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

type StatusDoacao = 'PENDENTE' | 'REPARO' | 'EM_ANALISE' | 'APROVADA' | 'APROVADO' | 'REPROVADA' | 'REPROVADO' | 'EM_ESTOQUE' | 'VINCULADA' | 'DOADO';

@Component({
  selector: 'app-pagina-detalhes-doacao',
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
    MatIconModule
  ],
  templateUrl: './pagina-detalhes-doacao.html',
  styleUrl: './pagina-detalhes-doacao.css'
})
export class PaginaDetalhesDoacao {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  idDoacao = this.route.snapshot.paramMap.get('id') ?? '001';
  private doacaoNavegacao = typeof history !== 'undefined' ? history.state?.doacao : null;

  doacao = {
    id: this.idDoacao,
    tipoItem: this.doacaoNavegacao?.equipamento ?? 'COMPUTADOR',
    descricao: this.doacaoNavegacao?.descricao ?? 'Computador completo em bom estado, com sinais de uso.',
    estadoConservacao: this.doacaoNavegacao?.statusConservacao ?? 'USADO',
    status: (this.doacaoNavegacao?.status ?? 'PENDENTE') as StatusDoacao,
    dataCadastro: this.doacaoNavegacao?.dataCadastro ?? '2025-05-01',
    dataUltimaModificacao: this.doacaoNavegacao?.ultimaAtualizacao
      ?? this.doacaoNavegacao?.dataUltimaAtualizacao
      ?? '2025-05-01',
    imagensUrls: this.montarImagensUrls(this.doacaoNavegacao)
  };

  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];

  form = this.fb.group({
    tipoItem: [{ value: this.doacao.tipoItem, disabled: true }],
    descricao: [{ value: this.doacao.descricao, disabled: true }],
    estadoConservacao: [{ value: this.doacao.estadoConservacao, disabled: true }]
  });

  voltar(): void {
    this.router.navigate(['/usuario/listar-doacoes']);
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
      case 'EM_ESTOQUE':
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
      case 'EM_ESTOQUE':
        return 'Em estoque';
      case 'VINCULADA':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      default:
        return status;
    }
  }

  get doacaoReprovada(): boolean {
    const status = this.normalizarStatus(this.doacao.status);
    return status === 'REPROVADA' || status === 'REPROVADO';
  }

  private normalizarStatus(status: string): string {
    return status
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private montarImagensUrls(doacao: any): string[] {
    if (Array.isArray(doacao?.imagens)) {
      return doacao.imagens
        .map((imagem: any) => this.montarImagemUrl(imagem?.url))
        .filter((url: string | null): url is string => url !== null);
    }

    const imagemLegada = this.montarImagemUrl(doacao?.url ?? doacao?.imagem);
    return imagemLegada ? [imagemLegada] : [];
  }

  private montarImagemUrl(imagem: unknown): string | null {
    if (typeof imagem !== 'string' || !imagem.trim()) {
      return null;
    }

    const valor = imagem.trim();
    return valor.startsWith('/') ? `http://localhost:8080${valor}` : valor;
  }
}
