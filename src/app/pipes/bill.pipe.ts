import { Pipe, PipeTransform } from '@angular/core';
import { Applications, BillInfoData, Study } from '../interfaces/student';

@Pipe({
  name: 'bill'
})
export class BillPipe implements PipeTransform {

  transform(items: BillInfoData[], searchText: string): BillInfoData[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
  
    return items.filter(myItem => {
      return myItem.studentNo.toLocaleLowerCase().includes(searchText);

    });

  }


}
