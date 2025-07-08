import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'news-list',
    pathMatch: 'full',
  },
  {
    path: 'news-list',
    loadChildren: () =>
      import('./routes/news/news.routes').then((m) => m.newsRoute),
  },
];
