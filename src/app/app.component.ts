import { Component, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
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
  @ViewChild('appHeader', { static: true }) appHeader: ElementRef;
  title$: Observable<string>;
  scrollY$ = fromEvent(window, 'scroll').pipe(
    map(() => this.getScrollY()),
    startWith(this.getScrollY()),
    distinctUntilChanged()
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    // Get the activated route on Navigation end
    const route$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute)
    );

    // Get the first child route AKA the root
    const primaryRoute$ = route$.pipe(
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary')
    );

    // Get the first child route AKA the root
    const routeData$ = primaryRoute$.pipe(mergeMap(route => route.data));
    // Get the actual title from the route data
    this.title$ = routeData$.pipe(map(({ title }) => title));

    this.title$.subscribe(title => {
      // Scroll to top
      window.scrollTo(0, 0);
      // Clear focus
      this.appHeader.nativeElement.focus();
      // Set title to the page
      this.titleService.setTitle(title);
    });
  }

  private getScrollY() {
    return Math.round(window.scrollY / 10) * 10;
  }
}
