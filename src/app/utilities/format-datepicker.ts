// https://stackblitz.com/edit/date-picker-format-change?file=src%2Fapp%2Fcomponents%2Fdate-picker.component%2Fdate-picker.component.html
// https://www.angularjswiki.com/material/datepicker/
import {NativeDateAdapter, MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter,
    MAT_DATE_FORMATS,
    MatDateFormats} from '@angular/material/core';
import { Injectable } from '@angular/core';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: any): string {
      if (displayFormat === 'input') {
        let day: string = date.getDate().toString();
        day = +day < 10 ?  '0' + day : day;
        let month: string = (date.getMonth() + 1).toString();
        month = +month < 10 ? '0' + month : month;
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
      return date.toDateString();
    }
  }
export const APP_DATE_FORMATS: MatDateFormats = {
    parse: {
      dateInput: { month:  'short', year:  'numeric', day:  'numeric' },
    },
    display: {
      dateInput:  'input',
      monthYearLabel: { year:  'numeric', month:  'numeric' },
      dateA11yLabel: { year:  'numeric', month:  'long', day:  'numeric'
      },
      monthYearA11yLabel: { year:  'numeric', month:  'long' },
    }
  };
