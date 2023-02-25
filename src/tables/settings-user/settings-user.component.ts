import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';


import { UserService } from 'src/app/services/user.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SettingsService } from 'src/app/services/settings.service';

import { UserPipe } from 'src/app/pipes/user.pipe';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-settings-user',
  templateUrl: './settings-user.component.html',
  styleUrls: ['./settings-user.component.css'],
  providers: [UserPipe]

})
export class SettingsUserComponent implements OnInit {

  displayedColumns: string[] = ['staffID', 'password', 'lName', 'fName',
  'permission', 'status', 'action'];
  permissionList = [
    'USER', 'TECH', 'ADMINISTRATOR'
  ];
  Titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Alh', 'Prof', 'Past',
  'Rev', 'Chief' ];
  statusList = [ true, false];



  title = '';
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();
  statusChangeList: boolean[] = [];
  newEntry = false;
  selectedDish: Partial <User> = {};
  filterValues = '';
  promptAnswer: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  drinkAttribute = [];
  drinkType = [];



  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(
    // private drinkPipe: DrinkPipe,
    private userPipe: UserPipe,
    private userService: UserService,
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
    this.userService.getUsers().subscribe((val) => {
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
    tempData.splice(0, 0, this.selectedDish as User);

    this.dataSource.data = tempData;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.statusChangeList[i] = false;
    }
    this.newEntry = true;
    // this.doEdit('');
    this.setStatusOfChange(0, true);

  }

  updateDrink(aUser: User, index: number, toBeDeleted: boolean): void {
    this.selectedDish = aUser;
    console.log("SELECTED DISH::::", this.selectedDish);
    // const answer = this.userPipe.transform(this.dataSource.data, name);
    // this.selectedDish.staffID = answer[0].staffID;
    // this.selectedDish.fName = answer[0].fName;
    // this.selectedDish.lName = answer[0].lName;
    // const tempListanswer = (answer[0].userAccessList ? answer[0].userAccessList : []);
    // tempListanswer.push(this.userService.getUser());
    // this.selectedDish.userAccessList = tempListanswer;
    // const tempListanswer2 = (answer[0].userTimeList ? answer[0].userTimeList : []);
    // tempListanswer2.push(new Date());
    // this.selectedDish.userTimeList = tempListanswer2;
    // const tempListanswer3 = (answer[0].priceList ? answer[0].priceList : []);
    // tempListanswer3.push(answer[0].price);
    // this.selectedDish.isActive = tempListanswer3;

    if (this.newEntry) {

      if (!toBeDeleted) {
        aUser.staffID_in = this.userService.getUser();
        this.userService.createUser(aUser as User);
        this.newEntry = false;
        this.reset();

      }

    }
    else {


      { this.userService.editUser(this.selectedDish as User); }


    }
  }

  // openBottomSheet(): void {
  //   const sheetRef =  this.bottomSheet.open(BottomSheetComponent, {
  //     // data: {name: 'User'}
  //   });
  //   sheetRef.afterDismissed().subscribe( data => {
  //     if (data && data.message === 'Cancel') {
  //     }
  //     if ( data && data.message === 'Status') {
  //       this.promptAnswer.next(1);
  //     }
  //   });
  // }

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
