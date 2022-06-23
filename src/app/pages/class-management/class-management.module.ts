import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassManagementRoutingModule } from './class-management-routing.module';


import { IconModule } from '@visurel/iconify-angular';
import { DragScrollDirective } from 'src/app/0.shared/directives/drag-scroll.directive';
import { ComclassComponent } from './comclass/comclass.component';
import { ComclassCanvasComponent } from './comclass-canvas/comclass-canvas.component';
import { ComclassFabsComponent } from './comclass-fabs/comclass-fabs.component';
import { ComclassNavComponent } from './comclass-nav/comclass-nav.component';
import { ComclassNewpageComponent } from './comclass-newpage/comclass-newpage.component';
import { ComclassStudentComponent } from './comclass-student/comclass-student.component';
import { ComclassThumbComponent } from './comclass-thumb/comclass-thumb.component';
import { OpenFileComponent } from './comclass-newpage/open-file/open-file.component';
import { ComclassFileViewComponent } from './comclass-file-view/comclass-file-view.component';
import { ComclassSlideViewComponent } from './comclass-slide-view/comclass-slide-view.component';
import { NgMaterialUIModule } from 'src/app/ng-material-ui/ng-material-ui.module';
import { MatIconModule } from '@angular/material/icon';






@NgModule({
  declarations: [
    ComclassComponent,
    ComclassCanvasComponent,
    ComclassFabsComponent,
    ComclassNavComponent,
    ComclassNewpageComponent,
    ComclassStudentComponent,
    ComclassThumbComponent,
    OpenFileComponent,
    ComclassFileViewComponent,
    ComclassSlideViewComponent,
    DragScrollDirective
    ],
  imports: [
    CommonModule,
    ClassManagementRoutingModule,
    NgMaterialUIModule,
    MatIconModule,
    IconModule
  ],
  exports: []
})
export class ClassManagementModule { }
