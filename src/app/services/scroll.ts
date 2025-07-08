import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  constructor() {}

  scrollToElementById(id: string): void {
    const element = this.__getElementById(id);
    this.scrollToElement(element);
  }

  private __getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    return element!;
  }

  scrollToElementByIdNoSmooth(id: string): void {
    const element = this.__getElementById(id);
    element.scrollIntoView({ block: 'start' });
  }

  scrollToElement(element: HTMLElement): void {
    element.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}
