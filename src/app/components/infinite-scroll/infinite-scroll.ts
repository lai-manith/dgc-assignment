import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { Loading } from '../../components/loading/loading';
import { CONFIG } from '../../types/global-variable';

@Component({
  selector: 'app-infinite-scroll',
  imports: [NgTemplateOutlet, Loading],
  templateUrl: './infinite-scroll.html',
  styleUrl: './infinite-scroll.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfiniteScrollComponent implements AfterViewInit, OnDestroy {
  @Input() loading = signal(false);
  @Input() page = signal(0);
  @Input() limit = 20;
  @Input() allIds = signal<number[]>([]);
  @Input() loadingContainerClass = '';
  @Input() skeletonItemClass = '';
  @Input() loadMoreThreshold = CONFIG.loadMoreThreshold;
  @Input() scrollBuffer = CONFIG.scrollBuffer;
  @Input() hasMoreData = false;

  @Output() loadMore = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private scrollCleanup?: () => void;
  private autoLoadTimeoutId?: number;

  isLoaded: boolean = false;

  @ViewChild('sentinel', { static: true }) sentinel!: ElementRef;

  readonly skeletonItems = computed(() =>
    Array.from({ length: this.limit }, (_, index) => index)
  );

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  /**
   * Sets up intersection observer for infinite scroll
   * Triggers loading when sentinel element becomes visible
   */
  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.loading() && this.hasMoreData) {
          this.loadMore.emit();
        }
      },
      {
        root: null,
        rootMargin: `${this.loadMoreThreshold}px`,
        threshold: 0.1,
      }
    );

    this.observer.observe(this.sentinel.nativeElement);
    this.setupScrollListener();
  }

  /**
   * Sets up scroll listener as backup for intersection observer
   */
  private setupScrollListener(): void {
    let rafId: number;
    let isScheduled: boolean = false;

    const handleScroll = () => {
      if (isScheduled) return;

      isScheduled = true;
      rafId = requestAnimationFrame(() => {
        isScheduled = false;

        if (this.loading() || !this.hasMoreData) return;

        const rect = this.sentinel.nativeElement.getBoundingClientRect();
        const isNearViewport =
          rect.top < window.innerHeight + this.scrollBuffer;

        if (isNearViewport) {
          this.loadMore.emit();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    this.scrollCleanup = () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }

  /**
   * Schedules an auto-load check with debouncing
   */
  scheduleAutoLoadCheck(): void {
    if (this.autoLoadTimeoutId) {
      clearTimeout(this.autoLoadTimeoutId);
    }

    this.autoLoadTimeoutId = setTimeout(() => {
      this.performAutoLoadCheck();
    }, 50);
  }

  /**
   * Performs automatic loading check using viewport calculations
   */
  private performAutoLoadCheck(): void {
    if (this.loading() || this.isLoaded || !this.hasMoreData) return;

    requestAnimationFrame(() => {
      const rect = this.sentinel.nativeElement.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isInViewport) {
        this.loadMore.emit();
      } else {
        this.isLoaded = true;
      }
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.scrollCleanup?.();
    if (this.autoLoadTimeoutId) {
      clearTimeout(this.autoLoadTimeoutId);
    }
  }
}
