import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TagsService } from '../../services/tags.service';
import { UserService } from '../../../../core/auth/services/user.service';
import { NgClass } from '@angular/common';
import { tap } from 'rxjs/operators';
import { ArticleListComponent } from '../../components/article-list.component';
import { ArticleListConfig } from '../../models/article-list-config.model';
import { RxLet } from '@rx-angular/template/let';
import { IfAuthenticatedDirective } from '../../../../core/auth/if-authenticated.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [NgClass, ArticleListComponent, RxLet, IfAuthenticatedDirective],
})
export default class HomeComponent implements OnInit {
  isAuthenticated = false;
  tagsLoaded = false;
  listConfig: ArticleListConfig = {
    type: 'all',
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.isAuthenticated
      .pipe(
        tap((isAuth) => {
          if (isAuth) {
            this.setListTo('feed');
          } else {
            this.setListTo('all');
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((isAuth: boolean) => (this.isAuthenticated = isAuth));
  }

  setListTo(type: string = '', filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === 'feed' && !this.isAuthenticated) {
      void this.router.navigate(['/login']);
      return;
    }

    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
  }
}
