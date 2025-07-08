import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarColor'
})
export class AvatarColorPipe implements PipeTransform {
  private avatarColors = [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
    '#a855f7', // purple-500
  ];

  transform(username: string | undefined): string {
    if (!username) return this.avatarColors[0];
    
    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }
}