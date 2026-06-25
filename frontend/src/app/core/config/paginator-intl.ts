import { MatPaginatorIntl } from '@angular/material/paginator';

export function criarTraducaoPaginador(): MatPaginatorIntl {
  const paginador = new MatPaginatorIntl();

  paginador.itemsPerPageLabel = 'Itens por página:';
  paginador.nextPageLabel = 'Próxima página';
  paginador.previousPageLabel = 'Página anterior';
  paginador.firstPageLabel = 'Primeira página';
  paginador.lastPageLabel = 'Última página';
  paginador.getRangeLabel = (pagina: number, tamanhoPagina: number, total: number) => {
    if (total === 0 || tamanhoPagina === 0) {
      return `0 de ${total}`;
    }

    const inicio = pagina * tamanhoPagina;
    const fim = Math.min(inicio + tamanhoPagina, total);

    return `${inicio + 1} – ${fim} de ${total}`;
  };

  return paginador;
}
