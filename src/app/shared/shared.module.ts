import { CopyrightComponent } from './components/copyright/copyright.component';
import { LocalStorageService } from './services/local-storage.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    CopyrightComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  providers: [
    LocalStorageService
  ],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CopyrightComponent,
  ]
})
export class SharedModule { }
