import { Component, VERSION } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExampleDialogComponent } from './example-dialog/example-dialog.component';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  version = 'Angular: v' + VERSION.full;

  animal: string;
  name: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    let dialogRef = this.dialog.open(ExampleDialogComponent, {
      width: '250px',
      data: { name: this.name, animal: this.animal },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.animal = result;
    });
  }
}
