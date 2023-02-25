import { Pipe, PipeTransform } from '@angular/core';
import { Applications } from '../interfaces/student';

@Pipe({
  name: 'applicationPipe'
})
export class ApplicationPipe implements PipeTransform {

  transform(items: Applications[], searchText: string): Applications[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    console.log('search text: ', searchText);

    return items.filter(myItem => {
      return myItem.jambNo.toString().toLocaleLowerCase().includes(searchText)
      || myItem.lastName.toLocaleLowerCase().includes(searchText);

    });

  }

}
