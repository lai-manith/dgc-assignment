import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarInitials'
})
export class AvatarInitialsPipe implements PipeTransform {
  transform(username: string | undefined): string {
    if (!username) return '?';
    
    let firstLetter: string = '';
    let secondChar: string = '';
    
    // Single pass through the string with early exit
    for (let i = 0; i < username.length && (!firstLetter || !secondChar); i++) {
      const char = username[i];
      const code = char.charCodeAt(0);
      
      // Check if it's a letter (A-Z, a-z)
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      // Check if it's alphanumeric (letters + 0-9)
      const isAlphanumeric = isLetter || (code >= 48 && code <= 57);
      
      if (!firstLetter && isLetter) {
        firstLetter = char.toUpperCase();
      } else if (firstLetter && !secondChar && isAlphanumeric) {
        secondChar = char.toUpperCase();
      } else if (!firstLetter && isAlphanumeric) {
        firstLetter = char.toUpperCase();
      }
    }
    
    return firstLetter + (secondChar || '');
  }
}