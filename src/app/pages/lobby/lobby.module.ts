import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyRoutingModule } from './lobby-routing.module';
import { NgMaterialUIModule } from 'src/app/ng-material-ui/ng-material-ui.module';
import { LobbyComponent } from './lobby.component';
import { AddClassComponent } from './add-class/add-class.component';



@NgModule({
  declarations: [
    LobbyComponent,
    AddClassComponent
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    NgMaterialUIModule
  ]
})
export class LobbyModule { }
