import { Pipe, PipeTransform } from '@angular/core';
import { Faculty } from '../interfaces/product';

@Pipe({
  name: 'faculty'
})
export class FacultyPipe implements PipeTransform {

  transform(items: Faculty[], searchText: string): Faculty[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    console.log('search text: ', searchText);

    return items.filter(myItem => {
      return myItem.dCode.toLocaleLowerCase().includes(searchText)
      || myItem.dName.toLocaleLowerCase().includes(searchText);

    });

  }


}
