import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('medalsChart') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  public olympics$!: Observable<Olympic[] | null | undefined>;
  public gamesCount = 0; // nombre d'années distinctes (tous pays confondus)
  public countryCount = 0; // nombre de pays participants

  constructor(private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();

    this.olympics$.subscribe((olympics) => {
      if (!olympics) return;

      const labels: string[] = []; // noms des pays
      const totalMedalsCount: number[] = []; // total des médailles par pays
      const years = new Set<number>(); // nombre d'années distinctes

      for (const o of olympics) {
        labels.push(o.country);
        let sum = 0;
        for (const p of (o.participations || [])) {
          sum += (p.medalsCount ?? 0);
          if (p.year) {
            years.add(p.year);
          }
        }
        totalMedalsCount.push(sum);
      }

      this.countryCount = olympics.length;
      this.gamesCount = years.size;

      const ctx = this.canvasRef?.nativeElement.getContext('2d');
      if (!ctx) return;

      const clickHandler = (evt: any, elements: any[]) => {
        if (!elements || !elements.length) return;
        const idx = elements[0].index ?? elements[0].dataIndex;
        const item = olympics[idx];
        if (item?.id != null) {
          this.router.navigate(['/detail', item.id]);
        }
      };

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = totalMedalsCount;
        this.chart.options.onClick = clickHandler;
        this.chart.update();
      } else {
        this.chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                data: totalMedalsCount,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } },
            onClick: clickHandler
          },
        });
      }
    });
  }
}
