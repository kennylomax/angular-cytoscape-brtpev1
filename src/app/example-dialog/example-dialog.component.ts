import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-example-dialog',
  templateUrl: 'example-dialog.component.html',
  styleUrls: ['./example-dialog.css'],
})
export class ExampleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ExampleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  enableok: boolean = true;

  onCancel(): void {
    this.dialogRef.close();
  }

  dialogChanging() {
    console.log('Dialog changing1 ' + JSON.stringify(this.data.choice));
    this.enableok = !this.data.names.includes(
      this.data.choice.trim().toLowerCase()
    );
  }

  @HostListener('window:keyup', ['$event'])
  onDialogClick(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close(this.data.choice);
  }
}
