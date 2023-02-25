import { Pipe, PipeTransform } from '@angular/core';
import { Applications, Study } from '../interfaces/student';

@Pipe({
  name: 'study'
})
export class StudyPipe implements PipeTransform {

  transform(items: Study[], searchText: Applications): Study[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    const searchTextJamb = searchText.jambNo?.toLowerCase() || '';
    const searchApp = searchText.applicationNo?.toLowerCase() || '';
    // console.log('search text: ', searchText);
  
    return items.filter(myItem => {
      return myItem.jambNo!.toLocaleLowerCase().includes(searchTextJamb)
      || myItem.applicationNo!.toLocaleLowerCase().includes(searchApp);

    });

  }


}
