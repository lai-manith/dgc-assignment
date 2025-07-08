import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ScrollService } from '../../services/scroll';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly #scrollService = inject(ScrollService);

  navigationHeight = signal<number>(0);
  isScrollToBottom = signal(false);

  @ViewChild('navigation', { static: true }) navigation!: ElementRef;

  @HostListener('window:scroll', ['$event']) onScroll(event: Event) {
    const height: number = (event.target as HTMLDocument)?.scrollingElement?.scrollTop || 0;
    const condition: boolean = height >= 600;
    this.isScrollToBottom.set(condition);
  }

  ngAfterViewInit(): void {
    const navHeight: number = this.navigation.nativeElement.offsetHeight;
    this.navigationHeight.set(navHeight);
  }

  scrollToTop(): void {
    this.#scrollService.scrollToElementById('root-container');
  }
}
