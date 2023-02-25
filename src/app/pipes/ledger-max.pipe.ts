import { Pipe, PipeTransform } from '@angular/core';
import { StudentLedgerEntryMax2 } from '../interfaces/student';

@Pipe({
  name: 'ledgerMax'
})
export class LedgerMaxPipe implements PipeTransform {

  transform(items: StudentLedgerEntryMax2[], searchText: string): StudentLedgerEntryMax2[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();

    return items.filter(myItem => {
      return myItem.studentNo.toLocaleLowerCase().includes(searchText);

    });

  }


}
