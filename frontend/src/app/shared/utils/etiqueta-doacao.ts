import { DoacaoDTO } from '../../core/dto/daocao.dto';

type DoacaoEtiqueta = Partial<DoacaoDTO> & {
  dataUltimaAtualizacao?: string;
};

export function abrirJanelaEtiquetaVazia(): Window | null {
  const janela = window.open('', '_blank', 'width=720,height=520');

  if (!janela) {
    return null;
  }

  janela.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Carregando etiqueta</title>
      </head>
      <body>
        <p>Gerando etiqueta...</p>
      </body>
    </html>
  `);
  janela.document.close();

  return janela;
}

export function imprimirEtiquetaDoacao(doacao: DoacaoEtiqueta, janela: Window | null): void {
  if (!janela) {
    console.error('Nao foi possivel abrir a janela de impressao.');
    return;
  }

  const html = montarHtmlEtiqueta(doacao);
  janela.document.open();
  janela.document.write(html);
  janela.document.close();
  janela.focus();

  janela.setTimeout(() => {
    janela.print();
  }, 300);
}

function montarHtmlEtiqueta(doacao: DoacaoEtiqueta): string {
  const id = valor(doacao.id);
  const equipamento = valor(doacao.equipamento);
  const quantidade = valor(doacao.quantidade);
  const status = valor(doacao.status);
  const conservacao = valor(doacao.statusConservacao);
  const nome = valor(doacao.nome);
  const cpf = valor(doacao.cpf);
  const dataCadastro = formatarData(doacao.dataCadastro);
  const descricao = valor(doacao.descricao);
  const codigo = `DOACAO-${id}`;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Etiqueta ${escapeHtml(codigo)}</title>
        <style>
          @page {
            size: 80mm 50mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
            width: 80mm;
            height: 50mm;
            overflow: hidden;
          }

          .etiqueta {
            width: 80mm;
            height: 50mm;
            border: 1px solid #111827;
            padding: 3mm;
            display: flex;
            flex-direction: column;
            gap: 1.5mm;
            overflow: hidden;
            page-break-after: avoid;
            break-after: avoid;
          }

          .topo {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2mm;
            border-bottom: 1px solid #111827;
            padding-bottom: 1.5mm;
          }

          .titulo {
            font-size: 10pt;
            font-weight: 700;
            margin: 0;
          }

          .codigo {
            font-size: 7pt;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1mm 2.5mm;
            font-size: 7pt;
          }

          .campo {
            min-width: 0;
          }

          .campo.completo {
            grid-column: 1 / -1;
          }

          .label {
            display: block;
            font-size: 5.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #374151;
            margin-bottom: 0.2mm;
          }

          .valor {
            display: block;
            font-size: 7pt;
            line-height: 1.15;
            overflow-wrap: anywhere;
          }

          .descricao {
            max-height: 7mm;
            overflow: hidden;
          }

          .rodape {
            margin-top: auto;
            border-top: 1px solid #111827;
            padding-top: 1mm;
          }

          .barras {
            height: 5mm;
            display: flex;
            align-items: stretch;
            gap: 0.6mm;
          }

          .barras span {
            display: block;
            background: #111827;
            height: 100%;
          }

          .barras span:nth-child(1) { width: 1mm; }
          .barras span:nth-child(2) { width: 2mm; }
          .barras span:nth-child(3) { width: 1mm; }
          .barras span:nth-child(4) { width: 3mm; }
          .barras span:nth-child(5) { width: 1mm; }
          .barras span:nth-child(6) { width: 2mm; }
          .barras span:nth-child(7) { width: 3mm; }
          .barras span:nth-child(8) { width: 1mm; }
          .barras span:nth-child(9) { width: 2mm; }

          .codigo-rodape {
            margin-top: 0.5mm;
            font-size: 5.5pt;
            letter-spacing: 0;
          }
        </style>
      </head>
      <body>
        <main class="etiqueta">
          <section class="topo">
            <h1 class="titulo">Etiqueta de Doacao</h1>
            <div class="codigo">${escapeHtml(codigo)}</div>
          </section>

          <section class="grid">
            ${campo('ID', id)}
            ${campo('Data cadastro', dataCadastro)}
            ${campo('Equipamento', equipamento)}
            ${campo('Status', status)}
            ${campo('Conservacao', conservacao)}
            ${campo('Doador', nome)}
            ${campo('CPF', cpf)}
            ${campo('Descricao', descricao, true)}
          </section>

          <section class="rodape">
            <div class="barras" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
            </div>
            <div class="codigo-rodape">${escapeHtml(codigo)}</div>
          </section>
        </main>
      </body>
    </html>
  `;
}

function campo(label: string, conteudo: string, completo = false): string {
  const classe = completo ? 'campo completo' : 'campo';
  const valorClasse = completo ? 'valor descricao' : 'valor';

  return `
    <div class="${classe}">
      <span class="label">${escapeHtml(label)}</span>
      <span class="${valorClasse}">${escapeHtml(conteudo)}</span>
    </div>
  `;
}

function valor(conteudo: unknown): string {
  if (conteudo === null || conteudo === undefined || conteudo === '') {
    return '-';
  }

  return String(conteudo);
}

function formatarData(data?: string): string {
  if (!data) {
    return '-';
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return data;
  }

  return dataFormatada.toLocaleDateString('pt-BR');
}

function escapeHtml(valorOriginal: string): string {
  return valorOriginal
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
