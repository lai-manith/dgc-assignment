import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  @Input() classBinding: string = '';
}
