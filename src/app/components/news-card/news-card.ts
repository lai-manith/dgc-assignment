import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../pipes/time-ago-pipe';
import { NewsType } from '../../types/news';

declare global {
  function gtag(...args: any[]): void;
}

@Component({
  selector: 'app-news-card',
  imports: [TimeAgoPipe, RouterLink],
  templateUrl: './news-card.html',
  styleUrl: './news-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsCard {
  data = input<NewsType | null>(null, { alias: 'info' });

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  trackViewComment(): void {
    const newsData = this.data();
    if (newsData && typeof gtag !== 'undefined') {
      gtag('event', 'view_comment', {
        event_category: 'engagement',
        event_label: newsData.title || 'Untitled',
        news_id: newsData.id,
      });
    }
  }
}
