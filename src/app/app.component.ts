import { Component } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';

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
}
