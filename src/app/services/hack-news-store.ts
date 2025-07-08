import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  timeout
} from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { CommentType } from '../types/comment';
import { NewsType } from '../types/news';

@Injectable({
  providedIn: 'root',
})
export class HackerNewsService {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.apiUrl;

  // Cache for items to avoid duplicate requests
  private itemCache = new Map<number, Observable<NewsType>>();

  private readonly REQUEST_TIMEOUT = 20000; // 20 seconds
  // private readonly MAX_CONCURRENT_REQUESTS = 6; // Limit concurrent requests

  /** Get array of top story IDs */
  getTopStoryIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.API_BASE}/topstories.json`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError((error) => {
        console.error('Error fetching top story IDs:', error);
        throw error;
      })
    );
  }

  /** Get one item (post, comment) by ID with caching */
  getItem(id: number): Observable<NewsType> {
    // Check cache first
    if (this.itemCache.has(id)) {
      return this.itemCache.get(id)!;
    }

    const request = this.http
      .get<NewsType>(`${this.API_BASE}/item/${id}.json`)
      .pipe(
        catchError((error) => {
          console.error(`Error fetching item ${id}:`, error);
          // Remove from cache on error
          this.itemCache.delete(id);
          throw error;
        })
      );

    // Cache the request
    this.itemCache.set(id, request);
    return request;
  }

  /** Get multiple items by IDs in parallel with concurrency control */
  getItems(ids: number[]): Observable<NewsType[]> {
    if (!ids.length) return of([]);

    const requests = ids.map((id) => this.getItem(id));
    return forkJoin(requests);
  }

  getComment(id: number): Observable<CommentType> {
    return this.http.get<CommentType>(`${this.API_BASE}/item/${id}.json`);
  }

  getComments(ids: number[]): Observable<CommentType[]> {
    const requests = ids.map((id) =>
      this.getComment(id).pipe(catchError(() => EMPTY))
    );

    return forkJoin(requests).pipe(
      map((comments: CommentType[]) => {
        return comments.filter((comment) => comment !== null) as CommentType[];
      })
    );
  }

  /** Optimized version with controlled concurrency and progressive loading */
  // getItemsOptimized(ids: number[]): Observable<NewsType[]> {
  //   if (!ids.length) return of([]);

  //   // Process requests in batches to avoid overwhelming the server
  //   return from(ids).pipe(
  //     mergeMap(
  //       (id) =>
  //         this.getItem(id).pipe(
  //           catchError((error) => {
  //             console.warn(`Failed to load item ${id}:`, error);
  //             return of(null); // Return null for failed items instead of failing entire stream
  //           })
  //         ),
  //       this.MAX_CONCURRENT_REQUESTS // Limit concurrent requests
  //     ),
  //     toArray(), // Collect all results
  //     // Filter out null values (failed requests)
  //     mergeMap((items) =>
  //       of(items.filter((item): item is NewsType => item !== null))
  //     )
  //   );
  // }

  clearCache(): void {
    this.itemCache.clear();
  }
}
