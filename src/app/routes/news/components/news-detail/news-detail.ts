import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, tap } from 'rxjs/operators';
import { Loading } from '../../../../components/loading/loading';
import { ResponsiveHtmlPipe } from '../../../../pipes/responsive-html-pipe';
import { HackerNewsService } from '../../../../services/hack-news-store';
import { NewsType } from '../../../../types/news';
import { CommentWrapper } from '../comment-wrapper/comment-wrapper';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink, DatePipe, ResponsiveHtmlPipe, CommentWrapper, Loading],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #hackerNewsService = inject(HackerNewsService);
  readonly #destroyRef = inject(DestroyRef);

  readonly id: string = this.#route.snapshot.params['id'];

  post: NewsType | null = null;

  readonly loading = signal(false);

  ngOnInit(): void {
    if (this.id) {
      this.loadPost(+this.id);
    }
  }

  loadPost(id: number): void {
    this.loading.set(true);
    this.#hackerNewsService
      .getItem(id)
      .pipe(
        tap((post) => {
          this.post = post;
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
