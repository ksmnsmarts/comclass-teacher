import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassManagementComponent } from './class-management.component';

const routes: Routes = [
    {
		path: '',
        component: ClassManagementComponent,
	},
    // 잘못된 URL을 사용했을때 메인으로 보냄
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassManagementRoutingModule { }
