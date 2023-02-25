import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';


import {MatSortModule} from '@angular/material/sort';
import {MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatChipsModule} from '@angular/material/chips';
import { DatePipe } from '@angular/common';
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

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatDividerModule,
    MatToolbarModule, HttpClientModule,
    MatToolbarModule, MatButtonModule,
    MatMenuModule, MatSidenavModule,
    MatChipsModule, MatRadioModule,
    MatSnackBarModule, MatButtonToggleModule,
    MatIconModule, MatListModule,
    MatBottomSheetModule, MatCardModule,
    MatTableModule, MatPaginatorModule,
    MatSortModule, MatSelectModule,
    MatFormFieldModule, FormsModule,
    MatGridListModule, MatExpansionModule,
    MatInputModule, MatDatepickerModule,
    MatCheckboxModule, MatNativeDateModule,
    MatDialogModule, MatAutocompleteModule,
    MatSlideToggleModule, MatTooltipModule,
    ReactiveFormsModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatTabsModule,
    MatStepperModule, MatBadgeModule,
    MatDialogModule, MatPaginatorModule, MatSnackBarModule, MatSortModule,
  ],
  exports: [MatDividerModule,
    MatToolbarModule, HttpClientModule,
    MatToolbarModule, MatButtonModule,
    MatMenuModule, MatSidenavModule,
    MatChipsModule, MatRadioModule,
    MatSnackBarModule, MatButtonToggleModule,
    MatIconModule, MatListModule,
    MatBottomSheetModule, MatCardModule,
    MatTableModule, MatPaginatorModule,
    MatSortModule, MatSelectModule,
    MatFormFieldModule, FormsModule,
    MatGridListModule, MatExpansionModule,
    MatInputModule, MatDatepickerModule,
    MatCheckboxModule, MatNativeDateModule,
    MatDialogModule, MatAutocompleteModule,
    MatSlideToggleModule, MatTooltipModule,
    ReactiveFormsModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatTabsModule,
    MatStepperModule, MatBadgeModule,
    MatDialogModule, MatPaginatorModule, MatSnackBarModule, MatSortModule,]
})
export class MaterialModule { }
