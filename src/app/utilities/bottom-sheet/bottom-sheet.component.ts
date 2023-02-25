import { Component, OnInit, Inject } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';


@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.css']
})
export class BottomSheetComponent implements OnInit {
  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

name: string;
  clearBar(): void {
    this.bottomSheetRef.dismiss({
      message: 'Cancel',
      data: this.data
    });
    event!.preventDefault();
  }

  changeStatus() {
    this.bottomSheetRef.dismiss({
      message: 'Status',
      data: this.data
    });
  }

  ngOnInit() {
    console.log('data received', this.data);
    this.name = this.data && this.data.name;
  }
}
