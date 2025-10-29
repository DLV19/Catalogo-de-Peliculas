
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],        // recuerda sin esto, routerLink no funcionara.
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {}
