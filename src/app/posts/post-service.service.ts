import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Post } from '../posts/post.model';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number): void {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
                creatorEmail: post.creatorEmail,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe(
        (changedPostData) => {
          this.posts = changedPostData.posts;
          this.postsUpdated.next({
            posts: [...this.posts],
            postCount: changedPostData.maxPosts,
          });
        },
        (err) => {
          this.postsUpdated.next({
            posts: [],
            postCount: 0,
          });
        }
      );
  }

  getPostUpdateListener(): Observable<{ posts: Post[]; postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      creatorEmail: string;
    }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http
      .post<{ id: string; imagePath: string }>(BACKEND_URL, postData)
      .subscribe((res) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: string | File
  ): void {
    let postData;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null,
      };
    }

    this.http.put(BACKEND_URL + id, postData).subscribe((res) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
