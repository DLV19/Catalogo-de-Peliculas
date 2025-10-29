import { Component, OnInit, signal, inject } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService, Movie } from '../core/movie.service';
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-movie',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './movie.html',
  styleUrls: ['./movie.scss']
})
export class MovieComponent implements OnInit {
  loading = signal(true);
  error   = signal<string | null>(null);
  movie   = signal<Movie | null>(null);

  private route = inject(ActivatedRoute);
  private api   = inject(MovieService);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const idParam = params.get('id');
          const id = Number(idParam);
          if (!idParam || Number.isNaN(id)) {
            this.error.set('ID inválido');
            this.loading.set(false);
            return of(null);
          }
          this.loading.set(true);
          this.error.set(null);
          return this.api.get(id);
        }),
        catchError((e) => {
          this.error.set((e as any)?.message ?? 'Error');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((m) => {
        if (!m) return;
        // 🔧 Normalización por si el backend usa nombres distintos
        const normalized: Movie = {
          ...m,
          cover: (m as any).cover ?? (m as any).poster_url ?? undefined,
          synopsis: (m as any).synopsis ?? (m as any).description ?? (m as any).detalle ?? ''
        };
        this.movie.set(normalized);
        this.loading.set(false);
      });
  }

  poster(title='Movie', cover?: string): string {
    if (cover) return cover;
    const t = encodeURIComponent((title || 'Movie').replace(/\s+/g, '+'));
    return `https://via.placeholder.com/400x600.png?text=${t}`;
  }

  share(): void {
    const m = this.movie();
    if (!m) return;
    const url = location.origin + '/movies/' + m.id;
    if (navigator.share) {
      navigator.share({ title: m.title, text: m.synopsis ?? m.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado al portapapeles');
    }
  }
}
