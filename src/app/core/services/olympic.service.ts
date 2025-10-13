import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[] | null | undefined>(undefined);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[]> {
    return this.http.get<any[]>(this.olympicUrl).pipe(
      map(arr => (Array.isArray(arr) ? arr.map(item => (item as Olympic)) : [])),
      tap((value: Olympic[]) => this.olympics$.next(value)),
      catchError((error) => {
        console.error(error);
        // push an empty array to indicate failure but keep the observable type consistent
        this.olympics$.next([]);
        return of([] as Olympic[]);
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
