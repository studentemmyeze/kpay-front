import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootnavComponent } from './rootnav/rootnav.component';

// import { MyAcctable1Component } from './accommodation-view/my-acctable1/my-acctable1.component';
// import { StaffService } from './services/staff.service';
// import { GoogleChartsModule } from 'angular-google-charts';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTreeModule} from '@angular/cdk/tree';
import {CdkTableModule} from '@angular/cdk/table'
// import { MatTableExporterModule } from 'mat-table-exporter';

import {MatSortModule} from '@angular/material/sort';
import {MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {FlexLayoutModule} from '@angular/flex-layout';
// import { RoomtableComponent } from './tables/roomtable/roomtable.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';
// import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
// import {MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { DatePipe } from '@angular/common';
// import { RoomService } from './services/room.service';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatStepperModule} from '@angular/material/stepper';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { SettingsComponent } from './topview/settings/settings.component';
import { ReportsComponent } from './topview/reports/reports.component';
import { LoginComponent } from './topview/login/login.component';
import { HomeComponent } from './topview/home/home.component';
// import { PayrollComponent } from './topview/payroll/payroll.component';
import { AddStudentComponent } from './dialogs/students/add-student/add-student.component';
import { EditStudentComponent } from './dialogs/students/edit-student/edit-student.component';
import { DeleteStudentComponent } from './dialogs/students/delete-student/delete-student.component';
import { StudentTable2Component } from './tables/student-table2/student-table2.component';
import { StudentInfoComponent } from './topview/student-info/student-info.component';
import { ApplicationPipe } from './pipes/application.pipe';
import { MakePaymentsComponent } from './kp/make-payments/make-payments.component';
import { MakepayComponent } from './topview/makepay/makepay.component';
import { StudentledgerComponent } from './kp/studentledger/studentledger.component';
import { StudentpostingComponent } from './kp/studentposting/studentposting.component';
import { AppDisableDirective } from './directives/app-disable.directive';
import { AppRequiredDirective } from './directives/app-required.directive';
import { PaymentInfoComponent } from './topview/payment-info/payment-info.component';
import { OutstandingComponent } from './topview/outstanding/outstanding.component';
import { LedgerMaxComponent } from './tables/ledger-max/ledger-max.component';
import { LedgerMax2Component } from './tables/ledger-max2/ledger-max2.component';
import { SettingsUserComponent } from './tables/settings-user/settings-user.component';
import { UserPipe } from './pipes/user.pipe';
import { PaymentstandingsComponent } from './tables/paymentstandings/paymentstandings.component';
import { DashboardCardComponent } from './utilities/dashboard-card/dashboard-card.component';
import { DashComponent } from './topview/dash/dash.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { LedgerSharedComponent } from './tables/ledger-shared/ledger-shared.component';
import { BalanceSharedComponent } from './tables/balance-shared/balance-shared.component';
import { SettingsProductComponent } from './tables/settings-product/settings-product.component';
import { ProductPipe } from './pipes/product.pipe';
import { BottomSheetComponent } from './utilities/bottom-sheet/bottom-sheet.component';
import { StudyPipe } from './pipes/study.pipe';
import { BillsComponent } from './topview/bills/bills.component';
import { BillPipe } from './pipes/bill.pipe';
import { LedgerMaxPipe } from './pipes/ledger-max.pipe';
import { AdvpostingComponent } from './topview/advposting/advposting.component';
import { MaterialModule } from './material/material.module';
import { SettingsSessionComponent } from './tables/settings-session/settings-session.component';
import { SettingsFacultyComponent } from './tables/settings-faculty/settings-faculty.component';
import { SettingsProgrammeComponent } from './tables/settings-programme/settings-programme.component';
import { FacultyPipe } from './pipes/faculty.pipe';
import { ProgrammePipe } from './pipes/programme.pipe';
import { Neo4jdatePipe } from './pipes/neo4jdate.pipe';
// import { Login2Component } from './topview/login2/login2.component';
// import { StoreModule } from '@ngrx/store';
// import { appReducer } from './app.reducer';

// import { DisableDirective } from './directives/disable.directive';
// import { MatIconRegistry } from "@angular/material/icon";

@NgModule({
  declarations: [
    AppComponent,
    RootnavComponent,
    SettingsComponent,
    ReportsComponent,
    LoginComponent,
    HomeComponent,
    // PayrollComponent,
    AddStudentComponent,
    EditStudentComponent,
    DeleteStudentComponent,
    StudentTable2Component,
    StudentInfoComponent,
    ApplicationPipe,
    MakePaymentsComponent,
    MakepayComponent,
    StudentledgerComponent,
    StudentpostingComponent,
    AppDisableDirective,
    AppRequiredDirective,
    PaymentInfoComponent,
    OutstandingComponent,
    LedgerMaxComponent,
    LedgerMax2Component,
    SettingsUserComponent,
    UserPipe,
    PaymentstandingsComponent,
    DashboardCardComponent,
    DashComponent,
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    LedgerSharedComponent,
    BalanceSharedComponent,
    SettingsProductComponent,
    ProductPipe,
    BottomSheetComponent,
    StudyPipe,
    BillsComponent,
    BillPipe,
    LedgerMaxPipe,
    AdvpostingComponent,
    SettingsSessionComponent,
    SettingsFacultyComponent,
    SettingsProgrammeComponent,
    FacultyPipe,
    ProgrammePipe,
    Neo4jdatePipe,
    // Login2Component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LayoutModule,
    CommonModule,
    HttpClientModule,
    MaterialModule,

    FlexLayoutModule,

  ],
  exports: [
    CdkTableModule,
    MatIconModule,
  ],
  providers: [ {
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
