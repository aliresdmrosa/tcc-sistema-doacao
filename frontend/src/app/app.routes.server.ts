import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/usuarios/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/tecnicos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/tecnicos/:id/historico',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/tecnicos/:id/reparos/:idReparo',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/doacoes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/solicitacoes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'tecnico/doacoes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'tecnico/doacoes/:id/reparo',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuario/doacoes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuario/solicitacoes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
