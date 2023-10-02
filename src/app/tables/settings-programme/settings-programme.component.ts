import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SettingsService } from 'src/app/services/settings.service';

import { ApplicationService } from 'src/app/services/application.service';
import { Programme, ProgrammeFaculty } from 'src/app/interfaces/product';
import { ProgrammePipe } from 'src/app/pipes/programme.pipe';
import { DepartmentalService } from 'src/app/services/departmental.service';
@Component({
  selector: 'app-settings-programme',
  templateUrl: './settings-programme.component.html',
  styleUrls: ['./settings-programme.component.css'],
  providers: [ProgrammePipe]
})
export class SettingsProgrammeComponent implements OnInit {



  displayedColumns: string[] = ['dName', 'faculty', 'action'];


  statusList: string[] = [];

  dataSource: MatTableDataSource<Programme> = new MatTableDataSource<Programme>();
  statusChangeList: boolean[] = [];
  newEntry = false;
  selectedDish: Partial <Programme> = {};
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
    private programmePipe: ProgrammePipe,
    private departmentService: DepartmentalService,
    private utilityService: UtilityService,
    private bottomSheet: MatBottomSheet,
    private settingService: SettingsService,
    private applicationService: ApplicationService

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
    this.departmentService.getProgrammes().subscribe((val) => {
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

    // this.applicationService.
    this.applicationService.getFaculties().subscribe((data) => {
      this.statusList = data;
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
    this.statusList = this.applicationService.getFaculties();
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
    tempData.splice(0, 0, this.selectedDish as Programme);

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

  updateDrink(aUser: ProgrammeFaculty, index: number, toBeDeleted: boolean): void {
    this.selectedDish = aUser;
    console.log("SELECTED DISH::::", this.selectedDish);


    if (this.newEntry) {

      if (!toBeDeleted) {
        this.departmentService.setProgramme(aUser as ProgrammeFaculty,);
        this.newEntry = false;
        this.reset();

      }

    }
    else {


      { this.departmentService.setProgramme(this.selectedDish as ProgrammeFaculty); }


    }
  }


  removeDrink(i: number): void {
    const temp = this.dataSource.data;
    this.dataSource.data = this.utilityService.sliceTable
    (i, this.paginator, temp);

  }



  applyFilter(aFilterValue: string): void {

    this.dataSource.filter = aFilterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

