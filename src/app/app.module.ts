import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgMaterialUIModule } from './ng-material-ui/ng-material-ui.module';
import { IndexComponent } from './pages/index/index.component';


import { IconModule } from '@visurel/iconify-angular';

// Env
import { environment } from 'src/environments/environment';
import { AuthModule } from './pages/auth/auth.module';
import { DialogModule } from './0.shared/dialog/dialog.module';
import { MatIconModule } from '@angular/material/icon';
import { AdminGuard } from './0.shared/guard/admin.guard';
import { SignInGuard } from './0.shared/guard/signIn.guard';
import { DragScrollDirective } from './0.shared/directives/drag-scroll.directive';






export function tokenGetter() {
	return localStorage.getItem(environment.tokenName);
}


@NgModule({
    declarations: [
        AppComponent,
        IndexComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgMaterialUIModule,
        FormsModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              disallowedRoutes: [
                '/api/v1/auth/sign-in',
        	        '/api/v1/auth/sign-up',
              ]
            }
        }),
        AppRoutingModule,
        AuthModule,
        DialogModule,
        ReactiveFormsModule,
        MatIconModule,
        IconModule,
    ],
    providers: [SignInGuard, AdminGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
