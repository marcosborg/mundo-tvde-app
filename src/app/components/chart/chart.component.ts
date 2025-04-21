import { Component, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
})
export class ChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() activityData!: { tvde_operator: { name: string }; net: string }[]; // Recebe o array de dados
  chart: Chart | null = null;

  constructor() { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeChart();
    }, 1000);
  }

  initializeChart(): void {
    if (!this.activityData || this.activityData.length === 0) {
      console.error('Nenhum dado fornecido para o gráfico.');
      return;
    }

    // Filtra dados inválidos
    const validData = this.activityData.filter(item => item.tvde_operator?.name && item.net);

    if (validData.length === 0) {
      console.error('Dados inválidos ou incompletos.');
      return;
    }

    const labels = validData.map(item => item.tvde_operator.name);
    const data = validData.map(item => parseFloat(item.net));

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Receitas Líquidas',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  }

}
