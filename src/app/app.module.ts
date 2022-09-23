//Library components
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { DragAndDropModule } from 'angular-draggable-droppable';

//Main component
import { AppComponent } from './app.component';

//Other components
import { EditorComponent } from './editor/editor.component';

import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [BrowserModule, FormsModule, DragAndDropModule, MatTableModule],
  declarations: [AppComponent, EditorComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
