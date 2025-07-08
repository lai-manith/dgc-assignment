import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { InfiniteScrollComponent } from '../../../../components/infinite-scroll/infinite-scroll';
import { NewsCard } from '../../../../components/news-card/news-card';
import { HackerNewsService } from '../../../../services/hack-news-store';
import { CONFIG } from '../../../../types/global-variable';
import { NewsType } from '../../../../types/news';

@Component({
  selector: 'app-news-list',
  imports: [NewsCard, InfiniteScrollComponent],
  templateUrl: './news-list.html',
  styleUrl: './news-list.scss',
})
export class NewsList implements OnInit {
  readonly #service = inject(HackerNewsService);
  readonly #destroyRef = inject(DestroyRef);

  @ViewChild('infiniteScroll') infiniteScroll!: InfiniteScrollComponent;

  readonly allIds = signal<number[]>([]);
  readonly page = signal(0);
  readonly data = signal<NewsType[]>([]);
  readonly loading = signal(false);
  readonly retry = signal(false);

  readonly CONFIG = CONFIG;

  readonly limit: number = 20;

  readonly dataLength = computed(() => this.data().length);
  readonly allIdsLength = computed(() => this.allIds().length);
  readonly hasMoreData = computed(() => {
    const currentPage = this.page();
    const totalAvailable = this.allIds().length;
    const itemsLoaded = (currentPage + 1) * this.limit;
    return itemsLoaded < totalAvailable;
  });

  ngOnInit(): void {
    this.loadInitialNews();
  }

  /**
   * Loads the initial batch of news items
   * Fetches story IDs first, then loads the first page of actual news data
   */
  private loadInitialNews(): void {
    this.loading.set(true);
    this.#service
      .getTopStoryIds()
      .pipe(
        catchError(() => {
          // show retry button if loading fails
          this.retry.set(true);
          return EMPTY;
        }),
        tap((ids) => {
          this.allIds.set(ids);
          this.retry.set(false);
        }),
        switchMap(() => {
          const currentIds = this.getIdsByPage(0);
          return currentIds.length > 0
            ? this.#service.getItems(currentIds)
            : EMPTY;
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: (items) => {
          this.data.set(items);

          // Trigger auto-load check if needed
          if (this.infiniteScroll && !this.infiniteScroll.isLoaded) {
            this.infiniteScroll.scheduleAutoLoadCheck();
          }
        },
      });
  }

  /**
   * Loads the next page of news items
   * Appends new items to existing data array
   */
  loadMoreItems(): void {
    if (this.loading() || !this.hasMoreData()) return;

    const nextPage = this.page() + 1;
    const currentIds = this.getIdsByPage(nextPage);

    if (currentIds.length === 0) return;

    this.loading.set(true);
    this.page.set(nextPage);

    this.#service
      .getItems(currentIds)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: (items) => {
          this.data.update((prev) => [...prev, ...items]);

          // Trigger auto-load check if needed
          if (this.infiniteScroll && !this.infiniteScroll.isLoaded) {
            this.infiniteScroll.scheduleAutoLoadCheck();
          }
        },
      });
  }

  /**
   * Gets the news IDs for a specific page
   * @param pageNumber - The page number to get IDs for
   * @returns Array of news IDs for the specified page
   */
  private getIdsByPage(pageNumber: number): number[] {
    const ids = this.allIds();
    const start = pageNumber * this.limit;
    const end = start + this.limit;
    return ids.slice(start, end);
  }

  onRetry(): void {
    this.retry.set(false);
    this.loadInitialNews();
  }
}
