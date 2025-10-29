import { Component, OnInit, AfterViewInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MovieService, Movie } from '../core/movie.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './movies.html',
  styleUrls: ['./movies.scss']
})
export class MoviesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Estado UI
  loading = signal(true);
  error   = signal<string | null>(null);
  movies  = signal<Movie[]>([]);

  // carrusel
  @ViewChild('rail', { static: true }) railRef!: ElementRef<HTMLDivElement>;
  atStart = true;
  atEnd   = false;

  // guardamos la referencia del handler para poder removerlo
  private onScroll?: () => void;

  constructor(private api: MovieService) {}

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (data: Movie[]) => {
        // normaliza por si el API trae otro nombre para la portada
        const normalized = (data ?? []).map((m: Movie & { poster_url?: string }) => ({
          ...m,
          cover: m.cover ?? m.poster_url ?? null,
        })) as Movie[];
        this.movies.set(normalized);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set((e as any)?.message ?? 'Error cargando películas');
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    const rail = this.railRef?.nativeElement;
    if (!rail) return;

    this.onScroll = () => {
      const { scrollLeft, clientWidth, scrollWidth } = rail;
      this.atStart = scrollLeft <= 2;
      this.atEnd   = scrollLeft + clientWidth >= scrollWidth - 2;
    };

    rail.addEventListener('scroll', this.onScroll, { passive: true });
    // primer cálculo
    this.onScroll();
  }

  ngOnDestroy(): void {
    const rail = this.railRef?.nativeElement;
    if (rail && this.onScroll) {
      rail.removeEventListener('scroll', this.onScroll);
    }
  }

  // Desplaza el carrusel al hacer clic en las flechas
  scrollRail(direction: 'left' | 'right'): void {
    const rail = this.railRef?.nativeElement;
    if (!rail) return;
    const step = Math.round(rail.clientWidth * 0.9);
    rail.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  }

  // Placeholder si no hay carátula
  placeholder(title = 'Movie'): string {
    const t = encodeURIComponent((title || 'Movie').replace(/\s+/g, '+'));
    return `https://via.placeholder.com/500x750.png?text=${t}`;
  }

  // ✅ Confirmación con SweetAlert2 y eliminación
  deleteFromList(id: number): void {
    Swal.fire({
      title: '¿Eliminar película?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      background: '#1e1e2f',
      color: '#f8f9fa',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.loading.set(true);
      this.api.delete(id).subscribe({
        next: () => {
          this.movies.set(this.movies().filter(m => m.id !== id));
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'La película se eliminó correctamente.',
            showConfirmButton: false,
            timer: 2000,
            background: '#1e1e2f',
            color: '#f8f9fa',
          });
        },
        error: () => {
          this.loading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la película.',
            background: '#1e1e2f',
            color: '#f8f9fa',
          });
        },
      });
    });
  }
}
