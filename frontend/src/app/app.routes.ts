import { Routes } from '@angular/router';

// Layouts
import { LayoutAutenticacao } from './layouts/layout-autenticacao/layout-autenticacao';
import { LayoutPrincipal } from './layouts/layout-principal/layout-principal';

// Páginas públicas
import { PaginaLogin } from './features/auth/pages/pagina-login/pagina-login';
import { PaginaCadastrarUsuario } from './features/usuario/pages/pagina-cadastrar-usuario/pagina-cadastrar-usuario';
import { PaginaRedefinirSenha } from './features/auth/pages/pagina-redefinir-senha/pagina-redefinir-senha';
import { PaginaMensagemRedefinirSenha } from './features/auth/pages/pagina-mensagem-redefinir-senha/pagina-mensagem-redefinir-senha';
import { PaginaNovaSenha } from './features/auth/pages/pagina-nova-senha/pagina-nova-senha';
import { PaginaSucessoRedefinirSenha } from './features/auth/pages/pagina-sucesso-redefinir-senha/pagina-sucesso-redefinir-senha';

// Admin
import { PaginaDashboardAdmin } from './features/admin/pages/pagina-dashboard-admin/pagina-dashboard-admin';
import { PaginaListarUsuarios } from './features/admin/pages/pagina-listar-usuarios/pagina-listar-usuarios';
import { PaginaCadastrarTecnico } from './features/admin/pages/pagina-cadastrar-tecnico/pagina-cadastrar-tecnico';
import { PaginaDetalhesTecnico } from './features/admin/pages/pagina-detalhes-tecnico/pagina-detalhes-tecnico';
import { PaginaListarDoacaoAdmin } from './features/admin/pages/pagina-listar-doacao/pagina-listar-doacao';
import { PaginaListarSolicitacao } from './features/admin/pages/pagina-listar-solicitacao/pagina-listar-solicitacao';
import { PaginaDetalhesDoacaoAdmin } from './features/admin/pages/pagina-detalhes-doacao-admin/pagina-detalhes-doacao-admin';
import { PaginaDetalhesSolicitacaoAdmin } from './features/admin/pages/pagina-detalhes-solicitacao-admin/pagina-detalhes-solicitacao-admin';
import { PaginaAtribuirEquipamentoComponent } from './features/admin/pages/pagina-atribuir-equipamento/pagina-atribuir-equipamento';

// Técnico
import { PaginaDashboardTecnico } from './features/tecnico/pages/pagina-dashboard-tecnico/pagina-dashboard-tecnico';
import { PaginaDoacoesTecnicoComponent } from './features/tecnico/pages/pagina-doacoes-tecnico/pagina-doacoes-tecnico';
import { PaginaDetalhesDoacaoTecnico } from './features/tecnico/pages/pagina-detalhes-doacao-tecnico/pagina-detalhes-doacao-tecnico';
import { PaginaHistoricoReparosComponent } from './features/tecnico/pages/pagina-historico-reparos/pagina-historico-reparos';
import { PaginaReparoDoacaoComponent } from './features/tecnico/pages/pagina-reparo-doacao/pagina-reparo-doacao';
import { PaginaDetalhesUsuario } from './features/admin/pages/pagina-detalhes-usuario/pagina-detalhes-usuario';


// Usuário
import { PaginaDashboardUsuario } from './features/usuario/pages/pagina-dashboard-usuario/pagina-dashboard-usuario';
import { PaginaCadastroDoacao } from './features/usuario/pages/pagina-cadastro-doacao/pagina-cadastro-doacao';
import { PaginaListarDoacoes } from './features/usuario/pages/pagina-listar-doacoes/pagina-listar-doacoes';
import { PaginaCadastroSolicitacao } from './features/usuario/pages/pagina-cadastro-solicitacao/pagina-cadastro-solicitacao';
import { PaginaListarSolicitacoes } from './features/usuario/pages/pagina-listar-solicitacoes/pagina-listar-solicitacoes';
import { PaginaDetalhesDoacao } from './features/usuario/pages/pagina-detalhes-doacao/pagina-detalhes-doacao';
import { PaginaDetalhesSolicitacao } from './features/usuario/pages/pagina-detalhes-solicitacao/pagina-detalhes-solicitacao';
import { PaginaConfiguracaoPerfil } from './features/usuario/pages/pagina-configuracao-perfil/pagina-configuracao-perfil';


// Guards
import { authGuard } from './core/guards/auth.guard';
import { perfilGuard } from './core/guards/perfil.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutAutenticacao,
    children: [
      { path: '', component: PaginaLogin, pathMatch: 'full' },
      { path: 'login', component: PaginaLogin },
      { path: 'cadastro', component: PaginaCadastrarUsuario },
      { path: 'redefinir-senha', component: PaginaRedefinirSenha },
      { path: 'mensagem-redefinir-senha', component: PaginaMensagemRedefinirSenha },
      { path: 'nova-senha', component: PaginaNovaSenha },
      { path: 'sucesso-redefinir-senha', component: PaginaSucessoRedefinirSenha }
    ]
  },
  {
    path: '',
    component: LayoutPrincipal,
    // canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        component: PaginaDashboardAdmin,
        // canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/usuarios',
        component: PaginaListarUsuarios,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/usuarios/novo-tecnico',
        component: PaginaCadastrarTecnico,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/usuarios/:id',
        component: PaginaDetalhesUsuario,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/tecnicos/:id/historico',
        component: PaginaHistoricoReparosComponent,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
        
      {
        path: 'admin/tecnicos/:id',
        component: PaginaDetalhesTecnico,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },

      {
        path: 'admin/doacoes',
        component: PaginaListarDoacaoAdmin,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },

      {
        path: 'admin/solicitacoes',
        component: PaginaListarSolicitacao,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/doacoes/:id',
        component: PaginaDetalhesDoacaoAdmin,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/solicitacoes/:id',
        component: PaginaDetalhesSolicitacaoAdmin,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'admin/atribuir-equipamento',
        component: PaginaAtribuirEquipamentoComponent,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['ADMINISTRADOR'] }
      },
      {
        path: 'tecnico',
        component: PaginaDashboardTecnico,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['TECNICO'] }
      },
      {
        path: 'tecnico/doacoes',
        component: PaginaDoacoesTecnicoComponent,
        // canActivate: [perfilGuard],
        data: { perfisPermitidos: ['TECNICO'] }
      },
      {
        path: 'tecnico/doacoes/:id',
        component: PaginaDetalhesDoacaoTecnico,
        // canActivate: [perfilGuard],
        data: { perfisPermitidos: ['TECNICO'] }
      },
      {
        path: 'tecnico/historico',
        component: PaginaHistoricoReparosComponent,
        // canActivate: [perfilGuard],
        data: { perfisPermitidos: ['TECNICO'] }
      },
      {
        path: 'tecnico/doacoes/:id/reparo',
        component: PaginaReparoDoacaoComponent,
        // canActivate: [perfilGuard],
        data: { perfisPermitidos: ['TECNICO'] }
      },
      {
        path: 'usuario',
        component: PaginaDashboardUsuario,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['USUARIO'] }
      },
      {
        path: 'usuario/configuracao-perfil',
        component: PaginaConfiguracaoPerfil,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['USUARIO'] }
      },
      {
        path: 'usuario/cadastro-doacao',
        component: PaginaCadastroDoacao,
        //canActivate: [perfilGuard],
        data: { perfisPermitidos: ['USUARIO']}

      },

      {
      path: 'usuario/listar-doacoes',
      component: PaginaListarDoacoes,
      //canActivate: [perfilGuard],
      data: { perfisPermitidos: ['USUARIO'] }
      },

      {
      path: 'usuario/doacoes/:id',
      component: PaginaDetalhesDoacao,
      //canActivate: [perfilGuard],
      data: { perfisPermitidos: ['USUARIO'] }
      },

      {
      path: 'usuario/solicitacao-doacao',
      component: PaginaCadastroSolicitacao,
      // canActivate: [perfilGuard],
      data: { perfisPermitidos: ['USUARIO'] }
      },

      {
      path: 'usuario/listar-solicitacoes',
      component: PaginaListarSolicitacoes,
      // canActivate: [perfilGuard],
      data: { perfisPermitidos: ['USUARIO'] }
      },

      {
      path: 'usuario/solicitacoes/:id',
      component: PaginaDetalhesSolicitacao,
      // canActivate: [perfilGuard],
      data: { perfisPermitidos: ['USUARIO'] }
      },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
    ]
  }
];
