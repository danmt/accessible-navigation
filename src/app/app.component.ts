import { Component } from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  startWith,
  filter,
  mergeMap
} from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'accessible-navigation';
  scrollY$ = fromEvent(window, 'scroll').pipe(
    map(() => this.getScrollY()),
    startWith(this.getScrollY()),
    distinctUntilChanged()
  );

  private getScrollY() {
    return Math.round(window.scrollY / 10) * 10;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => this.titleService.setTitle(event['title']));
  }
}
