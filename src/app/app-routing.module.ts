import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
