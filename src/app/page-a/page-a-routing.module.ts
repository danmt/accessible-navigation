import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageAComponent } from './page-a.component';

const routes: Routes = [{ path: '', component: PageAComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageARoutingModule {}
