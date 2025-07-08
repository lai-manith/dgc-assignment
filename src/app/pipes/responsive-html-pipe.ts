import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'responsiveHtml',
})
export class ResponsiveHtmlPipe implements PipeTransform {
  readonly #sanitizer = inject(DomSanitizer);

  transform(html: string | undefined): SafeHtml {
    if (!html) return '';

    try {
      // Create a temporary DOM element to properly parse and manipulate HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Process all elements recursively
      this.processElements(tempDiv);

      return this.#sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
    } catch (error) {
      console.error('Error processing HTML in ResponsiveHtmlPipe:', error);
      // Fallback to original HTML if processing fails
      return this.#sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  private processElements(element: Element): void {
    // Process current element
    this.addResponsiveClasses(element);

    // Process all child elements recursively
    Array.from(element.children).forEach((child) => {
      this.processElements(child);
    });
  }

  private addResponsiveClasses(element: Element): void {
    const tagName = element.tagName.toLowerCase();

    // Define responsive classes for different elements
    const responsiveClasses: { [key: string]: string } = {
      img: 'max-w-full h-auto',
      table: 'w-full table-auto overflow-x-auto',
      pre: 'overflow-x-auto whitespace-pre-wrap text-sm',
      code: 'break-words bg-gray-100 px-1 py-0.5 rounded text-sm',
      blockquote: 'border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700',
      a: 'text-blue-600 hover:text-blue-800 underline break-all',
      p: 'mb-4 leading-relaxed break-words',
      h1: 'text-3xl font-bold mb-4 break-words',
      h2: 'text-2xl font-bold mb-3 break-words',
      h3: 'text-xl font-bold mb-2 break-words',
      h4: 'text-lg font-bold mb-2 break-words',
      h5: 'text-base font-bold mb-1 break-words',
      h6: 'text-sm font-bold mb-1 break-words',
      ul: 'list-disc pl-6 mb-4 space-y-1',
      ol: 'list-decimal pl-6 mb-4 space-y-1',
      li: 'break-words',
      div: 'break-words',
      span: 'break-words',
      strong: 'font-bold',
      em: 'italic',
      video: 'max-w-full h-auto',
      iframe: 'max-w-full',
    };

    // Get existing classes
    const existingClasses = element.getAttribute('class') || '';
    const newClasses = responsiveClasses[tagName];

    if (newClasses) {
      // Merge existing classes with new responsive classes
      const combinedClasses = existingClasses
        ? `${existingClasses} ${newClasses}`
        : newClasses;

      // Remove duplicate classes
      const uniqueClasses = [...new Set(combinedClasses.split(' '))].join(' ');

      element.setAttribute('class', uniqueClasses);
    }

    // Special handling for specific cases
    this.handleSpecialCases(element, tagName);
  }

  private handleSpecialCases(element: Element, tagName: string): void {
    switch (tagName) {
      case 'img':
        // Ensure images have alt text for accessibility
        if (!element.getAttribute('alt')) {
          element.setAttribute('alt', '');
        }
        // Add loading="lazy" for better performance
        if (!element.getAttribute('loading')) {
          element.setAttribute('loading', 'lazy');
        }
        break;

      case 'table':
        // Wrap table in a responsive container if not already wrapped
        if (!element.parentElement?.classList.contains('table-container')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'table-container overflow-x-auto';
          element.parentElement?.insertBefore(wrapper, element);
          wrapper.appendChild(element);
        }
        break;

      case 'a':
        // Add security attributes for external links
        const href = element.getAttribute('href');
        if (href && (href.startsWith('http') || href.startsWith('https'))) {
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        }
        break;

      case 'code':
        // If code is inside pre, don't add background
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          element.setAttribute(
            'class',
            element
              .getAttribute('class')
              ?.replace('bg-gray-100 px-1 py-0.5 rounded', '') || ''
          );
        }
        break;
    }
  }
}
