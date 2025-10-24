import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, map, Subject, takeUntil } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['../home/home.component.scss', './detail.component.scss']
})
export class DetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('medalsChart') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  public olympic$!: Observable<Olympic | undefined>;
  public olympic: Olympic | undefined;
  public entriesCount: number = 0;
  public totalMedalsCount: number = 0;
  public totalAthletesCount: number = 0;
  private destroy$!: Subject<boolean>;

  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();

    // charger les données si pas encore chargées
    this.olympicService.loadInitialData().pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.route.paramMap.pipe(
      map(pm => Number(pm.get('id'))),
      switchMap(id => this.olympicService.getOlympics().pipe(
        map((list: Olympic[] | null | undefined) => (list ?? []).find(o => o.id === id))
      )),
      takeUntil(this.destroy$)
    ).subscribe(olympic => {
      if (!olympic) return;

      this.olympic = olympic;
      this.entriesCount = olympic.participations.length;

      // réinitialiser les totaux avant le calcul
      this.totalMedalsCount = 0;
      this.totalAthletesCount = 0;

      for (const p of olympic.participations) {
        this.totalMedalsCount += p.medalsCount;
        this.totalAthletesCount += p.athleteCount;
      }

      this.updateChart();
    });
  }

  ngAfterViewInit(): void {
    // Une fois la vue rendue, on peut créer le graphique
    if (this.olympic) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.olympic || !this.canvasRef) return;

    const labels = this.olympic.participations.map(p => p.year);
    const data = this.olympic.participations.map(p => p.medalsCount);

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            title: {
              display: true,
              position: 'bottom',
              text: 'Dates',
              font: {
                size: 30,
                weight: 'bold',
                style: 'normal'
              },
            },
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
      });
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  goHome(): void {
    this.router.navigate(['/']); // ou '/home', '/olympics', etc.
  }
}
