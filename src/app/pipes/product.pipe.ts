import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../interfaces/product';

@Pipe({
  name: 'product'
})
export class ProductPipe implements PipeTransform {

  transform(items: Product[], searchText: string): Product[] {
    if (!items) { return []; }
    if (!searchText) { return items; }

    searchText = searchText.toLowerCase();
    console.log('search text: ', searchText);
  
    return items.filter(myItem => {
      return myItem.prodCode.toLocaleLowerCase().includes(searchText)
      || myItem.description.toLocaleLowerCase().includes(searchText);

    });

  }


}
