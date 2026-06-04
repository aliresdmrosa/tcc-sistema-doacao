import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke,
ApexTitleSubtitle, ApexXAxis, ApexYAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DoacaoService } from '../../../../core/services/doacao.service';



export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-pagina-dashboard-usuario',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgApexchartsModule],
  templateUrl: './pagina-dashboard-usuario.html',
  styleUrl: './pagina-dashboard-usuario.css'
})
export class PaginaDashboardUsuario implements OnInit {
  @ViewChild('donutChart') donutChart!: ChartComponent;
  @ViewChild('barChart') barChart!: ChartComponent;

  private doacaoService = inject(DoacaoService);
  private cdr = inject(ChangeDetectorRef);
  public totalDoacoes = 0;
  public totalAlunosBeneficiados = 0;

  carregarDadosDashboard(): void {
    this.doacaoService.obterDadosDashboard()
    
    .subscribe({
      next: (dados) => {
        console.log('Dados do dashboard:', dados);
        this.totalDoacoes = dados.totalDoacoes;
        this.totalAlunosBeneficiados = dados.totalDoacoesRealizadas;
        this.donutChartOptions.series = dados.doacoesPorEquipamento.map(item => item.total);
        this.donutChartOptions.labels = dados.doacoesPorEquipamento.map(item => item.equipamento);

        const dadosMeses = new Array(12).fill(0); // Inicializa um array com 12 meses

        dados.doacoesPorMes.forEach(item => {
          const index = Number(item.mes) - 1; // Ajusta o índice (Janeiro = 0, Fevereiro = 1, ...)
            dadosMeses[index] = item.total; // Preenche o total de doações para o mês correspondente
        });
        

        this.barChartOptions = {
          ...this.barChartOptions,
          series: [{
            ...this.barChartOptions.series[0], 
            data: [...dadosMeses] // Nova referência de array
          }]
        };

        this.cdr.detectChanges(); // Atualiza os gráficos com os novos dados  

      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
      }
    });
  }

  // pegar nome do usuário autenticado
  nomeUsuario = localStorage.getItem('nomeUsuario') || 'Usuário';

  // vir da API


  public donutChartOptions: DonutChartOptions = {
    series: [0, 0],
    chart: {
      type: 'donut',
      height: 280
    },
    labels: ['Computadores', 'Notebooks'],
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            width: 260
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ],
    legend: {
      position: 'right'
    },
    dataLabels: {
      enabled: true
    },
    stroke: {
      width: 1
    },
    title: {
      text: 'Equipamentos'
    }
  };

  public barChartOptions: BarChartOptions = {
    series: [
      {
        name: 'Alunos',
        data: [0, 0, 0, 0, 0, 0]
      }
    ],
    chart: {
      type: 'bar',
      height: 280
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    },
    yaxis: {
      title: {
        text: 'Quantidade'
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      bar: {
        borderRadius: 6
      }
    },
    title: {
      text: 'Beneficiados'
    }
  };

  ngOnInit(): void {
    this.carregarDadosDashboard();
  }
}
