import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../interfaces/user';

@Pipe({
  name: 'user'
})
export class UserPipe implements PipeTransform {

  transform(items: User[], searchText: string): User[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    console.log('search text: ', searchText);
  
    return items.filter(myItem => {
      return myItem.permission.toLocaleLowerCase().includes(searchText)
      || myItem.staffID.toLocaleLowerCase().includes(searchText);

    });

  }


}
