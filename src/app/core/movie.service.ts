// src/app/core/movie.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movie {
  id: number;
  title: string;
  year: number;
  cover?: string;
  synopsis?: string;
}
export type MovieDTO = Omit<Movie, 'id'>;

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api/movies';

  get(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.base}/${id}`);        // <-- genérico
  }

  list(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.base);                  // <-- genérico
  }

  create(body: MovieDTO): Observable<Movie> {
    return this.http.post<Movie>(this.base, body);             // <-- genérico
  }

  update(id: number, body: MovieDTO): Observable<Movie> {
    return this.http.put<Movie>(`${this.base}/${id}`, body);   // <-- genérico
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);       // <-- genérico
  }
}
