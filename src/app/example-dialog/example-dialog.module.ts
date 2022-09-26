import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCommonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';

import { ExampleDialogComponent } from './example-dialog.component';

@NgModule({
  declarations: [ExampleDialogComponent],
  entryComponents: [ExampleDialogComponent],
  imports: [
    FormsModule,
    MatButtonModule,
    MatCommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class ExampleDialogModule {}
