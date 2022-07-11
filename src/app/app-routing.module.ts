import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './0.shared/guard/admin.guard';
import { SignInGuard } from './0.shared/guard/signIn.guard';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { HomeComponent } from './pages/home/home.component';
import { IndexComponent } from './pages/index/index.component';

const routes: Routes = [
    { 
        path: 'welcome',
        component: IndexComponent,
        canActivate: [SignInGuard] 
    },
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    },
    {
		path: 'main',
		canActivate: [SignInGuard],
        loadChildren: () => import(`./pages/home/home.module`).then(m => m.HomeModule),
	},
    {
		path: 'lobby',
		canActivate: [SignInGuard, AdminGuard],
        loadChildren: () => import(`./pages/lobby/lobby.module`).then(m => m.LobbyModule),
	},
    {
		path: ':id',
		canActivate: [SignInGuard, AdminGuard],
        loadChildren: () => import(`./pages/class-management/class-management.module`).then(m => m.ClassManagementModule),
	},
    // {
	// 	path: '',
	// 	canActivate: [SignInGuard],
    //     children: [
	// 		{
	// 			path: 'main',
	// 			loadChildren: () => import(`./pages/home/home.module`).then(m => m.HomeModule),
	// 		},
    //         {
	// 			path: 'lobby',
    //             canActivate: [AdminGuard],
	// 			loadChildren: () => import(`./pages/lobby/lobby.module`).then(m => m.LobbyModule),
	// 		},
    //         {
	// 			path: ':id',
    //             canActivate: [AdminGuard],
	// 			loadChildren: () => import(`./pages/class-management/class-management.module`).then(m => m.ClassManagementModule),
	// 		},
    //     ]
    // },
    
    
    // 잘못된 URL을 사용했을때 메인으로 보냄
    {
        path: '**',
        redirectTo: 'welcome',
        pathMatch: 'full'
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
