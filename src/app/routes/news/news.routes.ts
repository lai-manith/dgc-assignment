import { Routes } from "@angular/router";

export const newsRoute: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/news-list/news-list').then(m => m.NewsList)
    },
    {
        path: ':id',
        loadComponent: () => import('./components/news-detail/news-detail').then(m => m.NewsDetail)
    }
]