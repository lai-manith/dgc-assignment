import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Loading } from '../../../../components/loading/loading';
import { AvatarInitialsPipe } from '../../../../pipes/avatar-code-pipe';
import { AvatarColorPipe } from '../../../../pipes/avatar-color-pipe';
import { ResponsiveHtmlPipe } from '../../../../pipes/responsive-html-pipe';
import { TimeAgoPipe } from '../../../../pipes/time-ago-pipe';
import { HackerNewsService } from '../../../../services/hack-news-store';
import { CommentType } from '../../../../types/comment';

@Component({
  selector: 'app-comment',
  imports: [
    TimeAgoPipe,
    Loading,
    AvatarColorPipe,
    AvatarInitialsPipe,
    ResponsiveHtmlPipe,
  ],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comment implements OnInit {
  readonly #hackerNewsService = inject(HackerNewsService);
  readonly #destroyRef = inject(DestroyRef);

  @Input({ required: true }) comment?: CommentType;
  @Input() level: number = 0;

  replies: CommentType[] = [];
  readonly showReplies = signal(false);
  readonly loadingReplies = signal(false);

  ngOnInit() {}

  toggleReplies(): void {
    if (!this.showReplies() && this.replies.length === 0) {
      this.loadReplies();
    }
    this.showReplies.set(!this.showReplies());
  }

  loadReplies(): void {
    if (!this.comment?.kids || this.comment?.kids?.length === 0) return;

    this.loadingReplies.set(true);
    this.#hackerNewsService
      .getComments(this.comment?.kids)
      .pipe(
        finalize(() => this.loadingReplies.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: (replies) => {
          this.replies = replies;
        },
      });
  }
}
