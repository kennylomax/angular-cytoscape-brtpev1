//Library components
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { DragAndDropModule } from 'angular-draggable-droppable';

//Main component
import { AppComponent } from './app.component';

//Other components
import { EditorComponent } from './editor/editor.component';
import {
  MatButtonModule,
  MatCommonModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';

import { MatTableModule } from '@angular/material/table';
import { ExampleDialogModule } from './example-dialog/example-dialog.module';

@NgModule({
  imports: [
    ExampleDialogModule,
    BrowserModule,
    FormsModule,
    DragAndDropModule,
    MatTableModule,
    MatButtonModule,
    MatCommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [AppComponent, EditorComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
