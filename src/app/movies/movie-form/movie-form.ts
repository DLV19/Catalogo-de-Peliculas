// src/app/movies/movie-form/movie-form.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService, Movie, MovieDTO } from '../../core/movie.service';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './movie-form.html',
  styleUrls: ['./movie-form.scss']
})
export class MovieFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(MovieService);

  loading = signal(false);
  movieId: number | null = null;
  isEdit = computed(() => this.movieId !== null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1888), Validators.max(2100)]],
    cover: [''],
    synopsis: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = +id;
      this.loading.set(true);
      this.api.get(this.movieId).subscribe({
        next: (m: Movie) => {
          this.form.patchValue({
            title: m.title,
            year: m.year,
            cover: m.cover ?? '',
            synopsis: m.synopsis ?? ''
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const dto: MovieDTO = this.form.getRawValue();

    const req$ = this.isEdit()
      ? this.api.update(this.movieId!, dto)
      : this.api.create(dto);

    req$.subscribe({
      next: () => this.router.navigate(['/movies']),
      error: () => this.loading.set(false),
    });
  }

  remove(): void {
    if (!this.isEdit()) return;
    if (!confirm('¿Eliminar esta película?')) return;
    this.loading.set(true);
    this.api.delete(this.movieId!).subscribe({
      next: () => this.router.navigate(['/movies']),
      error: () => this.loading.set(false),
    });
  }

  get f() { return this.form.controls; }
}
