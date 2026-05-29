import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { CURSOS, apenasNumeros, formatarCpf, normalizarGrr } from '../../../../shared/utils/form-validations';

interface ReparoResumo {
  id: number;
  equipamento: string;
  status: string;
  data: string;
}

interface TecnicoDetalhes {
  id: number;
  email: string;
  nome: string;
  cpf: string;
  grr: string;
  curso: string;
  dataCadastro: string;
  reparosConcluidos: ReparoResumo[];
  reparosEmAndamento: ReparoResumo[];
}

@Component({
  selector: 'app-pagina-detalhes-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-detalhes-tecnico.html',
  styleUrls: ['./pagina-detalhes-tecnico.css']
})
export class PaginaDetalhesTecnico implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  idTecnico = Number(this.route.snapshot.paramMap.get('id'));

  modoEdicao = false;
  carregando = false;
  cursos = CURSOS;

  tecnico: TecnicoDetalhes = {
    id: 1,
    email: 'vitoria@email.com',
    nome: 'Vitória Laís Souza',
    cpf: '11100110000',
    grr: '--',
    curso: '--',
    dataCadastro: '09/07/2025',
    reparosConcluidos: [
      {
        id: 1,
        equipamento: 'Notebook',
        status: 'FINALIZADO',
        data: '01/05/2025'
      }
    ],
    reparosEmAndamento: [
      {
        id: 2,
        equipamento: 'Computador',
        status: 'EM ANDAMENTO',
        data: '03/05/2025'
      }
    ]
  };

  tecnicoForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    grr: ['', [Validators.pattern(/^\d{8}$/)]],
    curso: ['']
  });

  ngOnInit(): void {
    this.carregarDadosMock();

    // chamada api
    // this.buscarTecnicoDaApi();
  }

  carregarDadosMock(): void {
    console.log('Carregando técnico mock:', this.idTecnico);

    this.preencherFormulario();
    this.tecnicoForm.disable();
  }

  buscarTecnicoDaApi(): void {
    // chamada api para buscar técnico por id
  }

  preencherFormulario(): void {
    this.tecnicoForm.patchValue({
      email: this.tecnico.email,
      nome: this.tecnico.nome,
      cpf: formatarCpf(this.tecnico.cpf),
      grr: this.tecnico.grr,
      curso: this.tecnico.curso
    });
  }

  voltar(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  ativarEdicao(): void {
    this.modoEdicao = true;
    this.tecnicoForm.enable();
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    this.preencherFormulario();
    this.tecnicoForm.disable();
  }

  salvar(): void {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dadosAtualizados = {
      email: this.tecnicoForm.value.email ?? '',
      nome: this.tecnicoForm.value.nome ?? '',
      cpf: apenasNumeros(this.tecnicoForm.value.cpf),
      grr: this.tecnicoForm.value.grr ?? '',
      curso: this.tecnicoForm.value.curso ?? ''
    };

    // mock
    this.tecnico = {
      ...this.tecnico,
      ...dadosAtualizados
    };

    console.log('Técnico atualizado:', this.tecnico);

    this.snackBar.open('Aluno técnico atualizado com sucesso!', 'Fechar', {
      duration: 3000
    });

    this.carregando = false;
    this.modoEdicao = false;
    this.tecnicoForm.disable();

    // chamada api
    // this.usuarioService.atualizarUsuario(this.tecnico.id, dadosAtualizados).subscribe(...)
  }

  deletar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir este perfil?',
        mensagem: 'Essa ação será permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      console.log('Deletar técnico:', this.tecnico.id);

      // chamada api para deletar técnico

      this.snackBar.open('Perfil excluído com sucesso!', 'Fechar', {
        duration: 3000
      });

      this.router.navigate(['/admin/usuarios']);
    });
  }

  abrirReparo(id: number): void {
    this.router.navigate(['/admin/reparos', id]);
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.tecnicoForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  aplicarMascaraCpf(): void {
    const campo = this.tecnicoForm.get('cpf');
    campo?.setValue(formatarCpf(campo.value), { emitEvent: false });
  }

  aplicarMascaraGrr(): void {
    const campo = this.tecnicoForm.get('grr');
    campo?.setValue(normalizarGrr(campo.value), { emitEvent: false });
  }
}
