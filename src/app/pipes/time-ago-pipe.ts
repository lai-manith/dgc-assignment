import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: number): string {
    const now = new Date().getTime();
    const timestamp = value * 1000; // if value is Unix timestamp in seconds
    const secondsAgo = Math.floor((now - timestamp) / 1000);

    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 604800)
      return `${Math.floor(secondsAgo / 86400)} days ago`;

    return new Date(timestamp).toLocaleDateString();
  }
}
