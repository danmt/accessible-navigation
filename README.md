# Make it Accessible: Navigation in Angular

Today we are gonna talk about navigation. Let's start by the begining, what's navigation?

> Web navigation refers to the process of navigating a network of information resources in the World Wide Web
> Wikipedia

In those terms we could say that when users _clicks_ a link, a navigation event is triggered, the browser captures this event and redirects the user to a new page. In pure HTML, this forces the user to load the entire html. When you use Angular, thinks change, you don't to load the whole html again, instead using AJAX you get only what changed.

I thought that was a magical thing and the benefits were huge in comparison to the way HTML links normally behave. Guess what, that's true until certain point, when you want to make accessible applications things get more complicated. Why? If you have read last Make it Accessible, you know how important HTML5 semantic elements are.

> If you havent read it. Check it out here.

Just like the native HTML buttons can help make things more accessible out of the box, by providing keyboard support and focus ability. Anchors are here to make your life easier.

## Anchors to the rescue

In pure HTML we use anchor elements with the href attribute, that way we can tell the browser to which url it has to redirect the user upon click. This triggers a full load of the app BUT there's a benefit to it, its accessibility. Screen reader users are used to the way native HTML navigation works, it helps by reading the title of the new page and setting the focus to the top of the document, also by having the title of the page changed the user knows the current location.

So it basically allows:

- Sighted users to know the current page by reading the title
- Unsighted users to know the current page by announcing to screen readers the title
- Sets focus to the top of the document

If you have used the Angular Router you know that all the accessibility features just mentioned are lost. So, if you are looking to make your Angular app more accessible, sooner than later you are gonna have to face this.

We are gonna solve each of the problems, one at a time. If you want to do all the coding process on your own, access this [broken version of the code](https://github.com/danmt/accessible-navigation/tree/broken-version) and follow my lead.

## Current page for Sighted Users

In this step we are going to focus on making sure the user has a way to know which is the current page. In the code I just gave you, you'll find a simple app with a header and some navigation, right now there's no way for the user to know the current page (besides reading the url, hoping its as readable as in the example).

This could be solved by having a different color for the currently active link in the header, so let's do that.

First we'll need to use the routerLinkActive directive in the anchors from the navigation. For this we need to go to the `src/app/app.component.html` file and replace the nav element with this one.

```html
<nav class="header__nav">
  <ul>
    <li>
      <a routerLink="/page-a" routerLinkActive="active">Page A</a>
    </li>
    <li>
      <a routerLink="/page-b" routerLinkActive="active">Page B</a>
    </li>
  </ul>
</nav>
```

So now Angular will make sure to add the class `active` to the anchor which route is currently active. Let's change the color of the active anchor. Go to the file `src/app/app.component.scss` and add a color white when it has the active class.

```scss
a {
  // ...

  &.active {
    color: white;
  }
}
```

> Make sure to put the `&.active` selector after all the ones that are already there.

Is the navigation accessible? Well, not really. What about color blind users? we need to give them a way to know. For that we'll add underline and outline to the active anchor. Let's go back to the `src/app/app.component.scss` file.

```scss
a {
  // ...

  &.active,
  &:hover,
  &:focus {
    color: white;
    outline: 1px solid white;
  }

  &.active {
    text-decoration: underline;
  }
}
```

Since the hover and focus have the outline and the color we want, I reorganized a the selectors to reduce the duplicated code.

Last thing we have to do is to make sure we update the title of the page for every time the url changes. For this I followed the instructions from Todd Motto in his article [Dynamic page titles in Angular 2 with router events](https://ultimatecourses.com/blog/dynamic-page-titles-angular-2-router-events) and did some changes to it.

This leads us to changing the `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  {
    path: 'page-a',
    data: { title: 'I am the super Page A' },
    loadChildren: () =>
      import('./page-a/page-a.module').then(m => m.PageAModule)
  },
  {
    path: 'page-b',
    data: { title: 'I am the not that super Page B' },
    loadChildren: () =>
      import('./page-b/page-b.module').then(m => m.PageBModule)
  }
];
```

The key here is that I included a data property to each route and gave each a title. Next we have to update the `src/app/app.component.ts` file.

```typescript
//...
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
  // ...
  title$: Observable<string>;

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
      // Set title to the page
      this.titleService.setTitle(title);
    });
  }
}
```

What I did was injecting the services we need, made a stream from the router events in order to get the current title and change it in the browser using the Title service. If you want to learn more of this, you can read Todd Motto's article.

You have just solved the first problem.

## Current page for Unsighted Users

You are here for accessibility, its the time for the unsighted users to be taken into account. For this you can use the `aria-live` attribute.

> Simple content changes which are not interactive should be marked as live regions.
> MDN Web Docs

That seems to be our use case, we want to announce users when there was a page transition. For that we'll create an element with aria-live, containing the title content.

To get started, go to the `src/app/app.component.html` file, and use Angular's **async** pipe to render the title.

```html
<div *ngIf="title$ | async as title" aria-live="assertive">
  <span [attr.aria-label]="title"></span>
</div>
```

If we put the title inside the span, instead of using `aria-label` we would need to hide this element from sighted users, this is a little trick I love to do instead. Also notice that we use the `aria-live` property with `assertive` to make sure this gets announced as soon as possible.

> NOTE: Normally, i wouldnt use an ngIf in the tag with the aria-live because it will start announcing after it gets instantiated. In this case that's exactly what we need because we dont want to announce the title again on first load.

Now every user using the app will know in which page they are. No matter their condition, we are almost there to make a more inclusive navigation.

## Manage focus and scroll

Lets make things even better now, you have probably noticed that whenever an Angular page transition occurs, if its possible, the scroll is retained in the same position, unless the page we have just transition has a height thats's less than the current scroll. So the first step would be to set the scroll to top on every page transition.

Just go back to the `src/app/app.component.ts` file and do this:

```typescript
// ...
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // ...
  ngOnInit() {
    // ...
    this.title$.subscribe(title => {
      // Scroll to top
      window.scrollTo(0, 0);
    });
  }
  // ...
}
```

Add a call to the scrollTo method from window using the parameters (0, 0), that way we tell the browser to scroll to the top of the document.

Whenever a page transition occurs in a pure HTML website, the focus is cleared and set to the first focusable element in the document. There's a trick for that, this is how you do it.

Go again to the `src/app/app.component.ts` file and do this:

```typescript
// ...
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // ...
  ngOnInit() {
    // ...
    this.title$.subscribe(title => {
      // Scroll to top
      window.scrollTo(0, 0);
    });
  }
  // ...
}
```

Just add that line inside the `title$` subscription. Okay, that was easy. The focus is slightly harder, so let's do it together, go again to the same file and do this:

```typescript
import { /* ... */ ViewChild, ElementRef } from '@angular/core';
// ...
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // ...
  @ViewChild('appHeader', { static: true }) appHeader: ElementRef;

  ngOnInit() {
    // ...
    this.title$.subscribe(title => {
      // Set focus to the appHeader
      this.appHeader.nativeElement.focus();
    });
  }
  // ...
}
```

This almost as easy as the step before, but instead of just calling a method on the window object, we have to create a reference to an element in the DOM and we used `ViewChild` decorator for that. So now we are setting the title, moving the scroll to top and setting the focus to the header in the `title$` subscription.

Don't forget to add the template reference in `src/app/app.component.ts` and making it focusable.

```html
<header class="header" tabindex="-1" #appHeader>
  <!-- ... -->
</header>
```

And we dont want the focus outline in the header so can do this:

```scss
.header {
  // ...
  &:focus {
    outline: none;
  }
  // ...
}
```

## Conclusion

After playing a little bit with Angular, we were able to make the navigation _feel_ like the native one. It's not the most accessible navigation in the world, but this can get you there and is **WAY BETTER** than nothing. If you want a finished solution, look at this [working version of the app](https://github.com/danmt/accessible-navigation).
