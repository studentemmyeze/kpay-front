import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';


import { UserService } from 'src/app/services/user.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SettingsService } from 'src/app/services/settings.service';

// import { BottomSheetComponent } from 'src/app/utilities/bottom-sheet/bottom-sheet.component';
import { Product } from 'src/app/interfaces/product';
import { ProductPipe } from 'src/app/pipes/product.pipe';
import { ProductService } from 'src/app/services/product.service';
import { BottomSheetComponent } from 'src/app/utilities/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-settings-product',
  templateUrl: './settings-product.component.html',
  styleUrls: ['./settings-product.component.css'],
  providers: [ProductPipe]

})
export class SettingsProductComponent implements OnInit {

  displayedColumns: string[] = ['prodCode', 'description', 'price', 'action'];

  statusList = [ true, false];



  title = '';
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>();
  statusChangeList: boolean[] = [];
  newEntry = false;
  selectedDish: Partial <Product> = {};
  filterValues = '';
  promptAnswer: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  drinkAttribute = [];
  drinkType = [];


  // staffID: string;
  //   lName: string;
  //   fName: string;
  //   password: string;
  //   permissions: string;
  //   isActive: boolean;
  //   staffID_in: string;
  //   createStamp?: Date;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(
    // private drinkPipe: DrinkPipe,
    private productPipe: ProductPipe,
    private userService: ProductService,
    private utilityService: UtilityService,
    private bottomSheet: MatBottomSheet,
    private settingService: SettingsService

    ) {
      this.loadMenu();
      // settingService.loadDrinkAttribute();
      // settingService.loadDrinkType();
      this.loadSettings();

  }

  loadSettings(): void {
    

    // this.settingService.DrinkTypeList.subscribe((val) => {
    //   if (val) {
    //     this.drinkType = val;
    //   }
    // });


  }

  loadMenu(): void {
    // this.barService.getMenu();
    this.userService.getProducts().subscribe((val) => {
      // this.dataSource.data =  (val);
      this.dataSource.data =  (val);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.statusChangeList = [];
      for (let i = 0; i < this.dataSource.data.length; i++) {
        // this.paymentTypeList[i] = 'Walk-in';
        this.statusChangeList[i] = false;

    }


    });

  }

  setStatusOfChange(i: number, status: boolean): void {
    this.statusChangeList[i] = status;
  }

  getStatusOfChange(i: number): boolean {

    return this.statusChangeList[i];
  }

  getDefValue(row: Product): boolean {
    let answer = false;
    if (row.notDefault) 
     { answer= true; }
    return answer;
    // var width = document.getElementById('foo').offsetWidth;
  }

  // saveDish(): void {
  //   // this.barService.createDrink(this.selectedDish as Drink);

  // }

  reset(): void {
    if (this.newEntry) {
      const tempData = this.dataSource.data;
      tempData.splice(0, 1);
      this.statusChangeList.splice(0, 1);
      this.dataSource.data = tempData;
    }

    for (let i = 0; i < this.statusChangeList.length; i++) {
      this.statusChangeList[i] = false;
    }

    this.newEntry = false;
  }

  newDrink(): void {
    this.reset();

    const tempData = this.dataSource.data;
    this.selectedDish = {};
    tempData.splice(0, 0, this.selectedDish as Product);

    this.dataSource.data = tempData;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.statusChangeList[i] = false;
    }
    this.newEntry = true;
    // this.doEdit('');
    this.setStatusOfChange(0, true);
    // this.loadMenu();

  }

  updateDrink(aUser: Product, index: number, toBeDeleted: boolean): void {
    this.selectedDish = aUser;
    
    // console.log("SELECTED DISH::::", this.selectedDish);


    if (this.newEntry) {

      if (!toBeDeleted) {
        
        this.userService.createProduct(aUser as Product).subscribe(
          (data) => {
            if (data) {
              this.newEntry = false;
        this.reset();
        this.loadMenu();

            }
          }
        );
        

      }
      else {
        this.newEntry = false;
        if (this.filterValues === '' )
          {this.removeDrink(index); }
        else { this.loadMenu(); }
        this.reset();
      }
      
    }
    else {
      if (toBeDeleted) {
        this.promptAnswer.next(0);

        // const message = 'WARNING!! YOU ARE ABOUT TO DELETE A DISH! Continue?';
        this.openBottomSheet();
        // this.openSnackBar(message, 'close');
        this.promptAnswer.subscribe((val) => {
          if (val === 1) {
            this.userService.deleteProduct(this.selectedDish as Product).subscribe(
              (val2) => {
                if (val2) {
                  if (this.filterValues === '' ) {this.removeDrink(index); }
                  else {
                    this.loadMenu();
                  }
    
                }
              }
            );
          }
        });
      }
        else   
      { this.userService.editProduct(this.selectedDish as Product); }


    }
  }

  openBottomSheet(): void {
    const sheetRef =  this.bottomSheet.open(BottomSheetComponent, {
      // data: {name: 'User'}
    });
    sheetRef.afterDismissed().subscribe( data => {
      if (data && data.message === 'Cancel') {
      }
      if ( data && data.message === 'Status') {
        this.promptAnswer.next(1);
      }
    });
  }

  removeDrink(i: number): void {
    const temp = this.dataSource.data;
    this.dataSource.data = this.utilityService.sliceTable
    (i, this.paginator, temp);

  }


  // doEdit(NameRow: string): void {
  //   console.log('REST SETTINGS: ', NameRow );
  //   console.log('REST SETTINGS: ', this.dataSource.data );

  // }


  applyFilter(aFilterValue: string): void {
    // const filterValue = (event.target as HTMLInputElement).value;
    
    this.dataSource.filter = aFilterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
