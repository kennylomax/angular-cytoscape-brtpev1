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
  MatSortModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { ExampleDialogModule } from './example-dialog/example-dialog.module';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    ExampleDialogModule,
    BrowserModule,
    FormsModule,
    DragAndDropModule,
    MatTableModule,
    MatButtonModule,
    MatCommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
  ],
  declarations: [AppComponent, EditorComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
