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
import { ClassManagementComponent } from './pages/class-management/class-management.component';
import { ClassManagementModule } from './pages/class-management/class-management.module';
import { ComclassCanvasComponent } from './pages/class-management/comclass-canvas/comclass-canvas.component';
import { ComclassFabsComponent } from './pages/class-management/comclass-fabs/comclass-fabs.component';
import { ComclassNavComponent } from './pages/class-management/comclass-nav/comclass-nav.component';
import { ComclassNewpageComponent } from './pages/class-management/comclass-newpage/comclass-newpage.component';
import { ComclassStudentComponent } from './pages/class-management/comclass-student/comclass-student.component';
import { ComclassThumbComponent } from './pages/class-management/comclass-thumb/comclass-thumb.component';





export function tokenGetter() {
	return localStorage.getItem(environment.tokenName);
}


@NgModule({
    declarations: [
        AppComponent,
        IndexComponent,
        
        ClassManagementComponent,
        ComclassCanvasComponent,
        ComclassFabsComponent,
        ComclassNavComponent,
        ComclassNewpageComponent,
        ComclassStudentComponent,
        ComclassThumbComponent
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
