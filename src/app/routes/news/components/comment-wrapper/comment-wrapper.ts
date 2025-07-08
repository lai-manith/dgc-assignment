import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { InfiniteScrollComponent } from '../../../../components/infinite-scroll/infinite-scroll';
import { HackerNewsService } from '../../../../services/hack-news-store';
import { CommentType } from '../../../../types/comment';
import { CONFIG } from '../../../../types/global-variable';
import { NewsType } from '../../../../types/news';
import { Comment } from '../comment/comment';

@Component({
  selector: 'app-comment-wrapper',
  imports: [InfiniteScrollComponent, Comment],
  templateUrl: './comment-wrapper.html',
  styleUrl: './comment-wrapper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentWrapper {
  readonly #service = inject(HackerNewsService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #route = inject(ActivatedRoute);

  @ViewChild('infiniteScroll') infiniteScroll!: InfiniteScrollComponent;

  readonly id: string = this.#route.snapshot.params['id'];

  readonly allIds = signal<number[]>([]);
  readonly page = signal(0);
  readonly data = signal<CommentType[]>([]);
  readonly loading = signal(false);

  readonly CONFIG = CONFIG;

  readonly limit: number = 10;

  readonly dataLength = computed(() => this.data().length);
  readonly allIdsLength = computed(() => this.allIds().length);
  readonly hasMoreData = computed(() => {
    const currentPage = this.page();
    const totalAvailable = this.allIds().length;
    const itemsLoaded = (currentPage + 1) * this.limit;
    return itemsLoaded < totalAvailable;
  });

  @Input() set post(data: NewsType) {
    this.allIds.set(data.kids || []);
    this.loadInitial();
  }

  /**
   * Loads the initial post
   * Fetches comment IDs first, then loads the first page of actual comment data
   */
  private loadInitial(): void {
    const currentIds = this.getIdsByPage(0);
    if (currentIds.length < 1) return;

    this.loading.set(true);

    this.#service
      .getComments(currentIds)
      .pipe(
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
   * Loads the next page of comment items
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
      .getComments(currentIds)
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
   * Gets the comment IDs for a specific page
   * @param pageNumber - The page number to get IDs for
   * @returns Array of comment IDs for the specified page
   */
  private getIdsByPage(pageNumber: number): number[] {
    const ids = this.allIds();
    const start = pageNumber * this.limit;
    const end = start + this.limit;
    return ids.slice(start, end);
  }
}
