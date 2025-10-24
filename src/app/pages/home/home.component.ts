import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('medalsChart') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  public olympics$!: Observable<Olympic[] | null | undefined>;
  public olympics: Olympic[] = [];
  public gamesCount = 0; // nombre d'années distinctes (tous pays confondus)
  public countryCount = 0; // nombre de pays participants

  constructor(private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    // lancer le chargement initial
    this.olympics$ = this.olympicService.loadInitialData().pipe(
      switchMap(() => this.olympicService.getOlympics())
    );

  // abonnement au flux des données
    this.olympics$.subscribe((olympics) => {
      if (!olympics) return;
      this.olympics = olympics;
      this.updateChart();
    });
  }

  ngAfterViewInit(): void {
    // Si les données sont déjà là, on peut créer le graphique maintenant
    if (this.olympics.length) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels: string[] = []; // noms des pays
    const totalMedalsCount: number[] = []; // total des médailles par pays
    const years = new Set<number>(); // nombre d'années distinctes

    for (const o of this.olympics) {
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
    this.countryCount = this.olympics.length;
    this.gamesCount = years.size;

    const clickHandler = (evt: any, elements: any[]) => {
      if (!elements || !elements.length) return;
      const idx = elements[0].index ?? elements[0].dataIndex;
      const item = this.olympics[idx];
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
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 20,
                },
              },
            }
          },
          onClick: clickHandler
        },
      });
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}

