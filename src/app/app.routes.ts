// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { MoviesComponent } from './movies/movies';
import { MovieComponent } from './movie/movie';
import { MovieFormComponent } from './movies/movie-form/movie-form';

export const routes: Routes = [
  // 🏠 Página principal
  { path: '', component: HomeComponent },

  // 🎬 Catálogo de películas
  { path: 'movies', component: MoviesComponent },

  // ➕ Nueva película
  { path: 'movies/new', component: MovieFormComponent },

  // ✏️ Editar película existente
  // 👇 más semántico y fácil de manejar
  { path: 'movies/:id/edit', component: MovieFormComponent },

  // 🔍 Ver detalle de una película
  { path: 'movies/:id', component: MovieComponent },

  // 🚨 Cualquier otra ruta → redirige a inicio
  { path: '**', redirectTo: '' },
];

