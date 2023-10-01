import { Pipe, PipeTransform } from '@angular/core';
import { Programme } from '../interfaces/product';

@Pipe({
  name: 'programme'
})
export class ProgrammePipe implements PipeTransform {

  transform(items: Programme[], searchText: string): Programme[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    console.log('search text: ', searchText);

    return items.filter(myItem => {
      myItem.pName.toLocaleLowerCase().includes(searchText);

    });

  }


}
