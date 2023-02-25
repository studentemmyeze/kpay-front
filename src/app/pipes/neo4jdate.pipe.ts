import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'neo4jdate'
})
export class Neo4jdatePipe implements PipeTransform {

  transform(items: {year: number, month: number, day: number, hour: number, minute: number, second: number, nanosecond: number, timeZoneOffsetSeconds:number}, searchText?: string): Date {
    // const newD = new Date()
    const dateObject = new Date(Date.UTC(items.year, (items.month-1), items.day, items.hour, items.minute, items.second, items.nanosecond/ 1000000));

    const timeZoneOffsetSeconds = 3600;
    dateObject.setUTCMinutes(dateObject.getUTCMinutes() - timeZoneOffsetSeconds / 60);
    return dateObject;
  }



}
