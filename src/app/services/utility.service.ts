// import { Inject, Injectable, LOCALE_ID } from '@angular/core';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
// import { KpClientService } from './kp-client.service';
// import { TU_LOGO_IMAGE } from '../utilities/sharedFile';
// import html2canvas from 'html2canvas'
// import autoTable, { RowInput } from 'jspdf-autotable'// import JSPDF from 'jspdf';
//
// // import { AddStaffComponent } from 'src/app/shared/components/dialogs/add-staff/add-staff.component';
//
// import * as XLSX from 'xlsx';
//
// import jsPDF from 'jspdf';
// import { formatDate } from '@angular/common';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class UtilityService {
//   isMessageFromMiniSales: BehaviorSubject<string> = new BehaviorSubject('');
//   isMessageFromMiniSalesRestaurant: BehaviorSubject<string> = new BehaviorSubject('');
//   isMessageStatus: BehaviorSubject<number> = new BehaviorSubject(0);
//   marker: BehaviorSubject<number> = new BehaviorSubject<number>(1);
//   send2Regmarker: number = 1;
//
//   matricStatus = 0;
//   logoImage = TU_LOGO_IMAGE;
//   constructor(
//     private snackBar: MatSnackBar,
//     private kpClient: KpClientService,
//     @Inject(LOCALE_ID) private locale: string
//
//   ) {
//     this.kpClient.getCurrentSessionMatricStatus().subscribe(
//       data => {
//         this.matricStatus = data ;
//       }
//
//     );
//   }
//
//   openSnackBar(message: string, action: string): void {
//     this.snackBar.open(message, action , {duration: 5000, });
//   }
//
//
//
//
//
//
//
//
//   // remove a String and replace
//   prepareQuery(query:string, searchValue: string): string {
//     const pieces = query.split(`"${searchValue}"`);
//     return pieces.join(searchValue);
//   }
//
//   replaceText(query: string, searchValue: string, replaceValue: string): string {
//     const pieces = query.split(`${searchValue}`);
//     return pieces.join(replaceValue);
//   }
//
//   prepareNewID4(): string {
//     const today = String(new Date());
//     // console.log('date string: ', today);
//     return today;
//   }
//
//   // this ID generator return a random id with a date prefix ie 2021130XXXXXXXX
//   prepareNewID3(expectedDigits: number): string {
//     const today = new Date();
//     const todaysYear = (Number(today.getFullYear()) % 100);
//     const todaysMonth = (Number(today.getMonth()) + 1);
//     const todaysDay = (Number(today.getDate()));
//
//     const randomNo = String(Math.floor(Math.random() * Math.floor(expectedDigits - 6)));
//     let tempRef = String(todaysYear)
//     +
//     ((String(todaysMonth)).length < 2 ?
//     ('0' + (String(todaysMonth))) : String(todaysMonth))
//     +
//     ((String(todaysDay)).length < 2 ?
//     ('0' + (String(todaysDay))) : String(todaysDay));
//
//     const tempRef2 = tempRef;
//     for (let i = 0; i < (expectedDigits - (tempRef2.length + randomNo.length)); i++)
//           {
//           tempRef = tempRef +  '0';
//           }
//     return(tempRef + randomNo);
//
//
//   }
//   prepareNewID(originalString: string, expectedDigits: number): string {
//     let answer = '';
//     const tempUserID = Number(originalString) + 1;
//     console.log ('THIS IS TEMPUSERID: ', tempUserID);
//     answer += tempUserID;
//     while (answer.length < expectedDigits) {
//       answer = '0' + answer;
//
//     }
//     return answer;
//   }
//
//
//   //numenclature of university student number = 202100001
//   prepareNewID2(
//     originalStringwith2digitYear: string,
//     expectedDigits: number): string {
//
//     const answer =  Number(originalStringwith2digitYear);
//     console.log('@prepareNewID2', originalStringwith2digitYear );
//     let answer3 = (Number(answer)) % (1 * Math.pow(10, expectedDigits - 4)); // reference number
//     // correct for notMatriculated
//
//     console.log('@prepareNewID2-answer3', answer3 );
//
//     const answer2 = Math.floor(Number(answer) / (1 * Math.pow(10, expectedDigits - 4))); // reference year
//     console.log('@prepareNewID2-answer2-reference year', answer2 );
//
//     const today = new Date();
//     let todaysYear = (Number(today.getFullYear()));
//       // correct for notMatriculated
//
//
//     if (answer2 !== todaysYear) { // not the same year reference
//       if (this.matricStatus) {
//         answer3 = 0;
//       }
//       else { todaysYear -= 1}
//
//       }
//     const NewNo = String(answer3 + 1); // do the increment in ref
//     let tempRef = String(todaysYear);
//     const tempRef2 = tempRef;
//     for (let i = 0; i < (expectedDigits - (tempRef2.length + NewNo.length)); i++)
//           {
//           tempRef = tempRef +  '0';
//           }
//     console.log('@prepareNewID2-result', (tempRef + NewNo) );
//
//     return(tempRef + NewNo);
//   }
//
//   // this function c
//
//
//
//   sliceTable(
//     myIndex: number, paginator: MatPaginator, data: any[]): any[] {
//       // console.log('INDEX: ', myIndex);
//       // console.log('PAGE INDEX: ', paginator.pageIndex);
//       // console.log('PAGE SIZE: ', paginator.pageSize);
//
//
//       // console.log('INDEX: ', myIndex);
//
//       const startIndex = paginator.pageIndex * paginator.pageSize;
//       const myPosition = startIndex + myIndex;
//       data.splice(myPosition,  1);
//       // console.log('@SPLICE TABLE: ', startIndex, myPosition);
//
//       return data; }
//
//
//   generateSessionList(): string[] {
//     const answer = [];
//     let seedYear = "2020";
//     let seedYearInt = 2020;
//     const aDate = new Date();
//     const currentYear = aDate.getFullYear();
//     let aYear = (currentYear) + 6;
//     for (let i = 0 ; (i + seedYearInt) <= aYear ; i++ )
//     {
//       seedYearInt += 1
//
//       answer.push(seedYear + "/" + (seedYearInt).toString());
//       seedYear = (seedYearInt).toString();
//
//     }
//     return answer;
//   }
//   getMyPositionOnTable(myIndex: number, paginator: MatPaginator): number {
//     const startIndex = paginator.pageIndex * paginator.pageSize;
//     const myPosition = startIndex + myIndex;
//     return myPosition;
//   }
//
//   setSalesMarker(aPaymentType: string): void {
//     this.isMessageFromMiniSales.next(aPaymentType);
//
//   }
//
//   setSalesMarkerRestaurant(aPaymentType: string): void {
//     this.isMessageFromMiniSalesRestaurant.next(aPaymentType);
//
//   }
//
//   setMessageStatus(aStatus: number): void {
//     this.isMessageStatus.next(aStatus);
//   }
//
//
//
//   exportToPdf(anArray: any[], afileName: string, aList: string[], searchP?: string, titleOfPdf?: string) {
//     let prepare: any[] = [];
//     const columnForMoney: number[] = []
//     const dateList: number[] = [];
//     for (let i = 0; i < aList.length; i++) {
//       if (aList[i].toLowerCase().includes('date') || aList[i].toLowerCase().includes('dob')) {dateList.push(i)}
//     }
//     const aList2 = aList.filter(item => item != 'actions');
//     anArray.forEach(
//       e => {
//       var tempObj = [];
//
//       for (let i=0; i < aList2.length ; i++){
//         let toPush = false;
//         let tempAnswer = (aList2[i])
//         if (dateList.includes(i)) {
//           toPush = true;
//         }
//         if (toPush) {
//           // eval(`tempObj.push( formatDate(new Date( e.${tempAnswer}), 'yyyy-MM-dd', this.locale));`);
//           toPush = false;
//           let temp = ''
//           eval(`temp = e.${tempAnswer}`)
//           // console.log('TEMP:::', temp);
//           const dateAnswer = temp ? RawUtil.getFormatedDate(temp)  : temp;
//           tempObj.push(dateAnswer);
//
//         }
//         else {
//           if (tempAnswer.toLowerCase() === 'cr' || tempAnswer.toLowerCase() === 'dr'
//           || tempAnswer.toLowerCase() === 'balance') {
//             let temp = ''
//             eval(`temp = e.${tempAnswer}`)
//             const MoneyAnswer = temp ? parseFloat(temp).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : ''
//             tempObj.push(MoneyAnswer);
//             if(!columnForMoney.includes(i)) {columnForMoney.push(i);}
//
//           }else
//
//           {eval(`tempObj.push(e.${tempAnswer});`);}
//         }
//         tempObj.push('');
//       }
//
//       prepare.push(tempObj);
//     });
//     let searchP1 = ''
//     let searchP2 = ''
//     const countSearch = searchP ? searchP.split(',') : [];
//     if (countSearch.length > 0)
//     {
//       for (let i = 0; i < countSearch.length; i++) {
//         if (i % 2 !== 0) {searchP1 += (countSearch[i] + ' ');}
//         else {searchP2 += (countSearch[i]+ ' ');}
//       }
//       searchP1.trim();
//       searchP2.trim();
//     }
//     const doc = new jsPDF({
//       orientation: "landscape"
//
//     });
//
//     const d = new Date();
//     const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
//     const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
//     const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
//     const bb = d.toLocaleTimeString('en-GB');
//     const myDate = (`Date: ${da}/${mo}/${ye} ${bb} `);
//     doc.text("TOPFAITH UNIVERSITY, MKPATAK", 50, 15);
//     doc.text("AKWAIBOM STATE", 50, 25);
//     doc.rect(180, 4, 110, 28);
//     doc.text("Report Parameters", 182, 10);
//     doc.setFontSize(9);
//     doc.text(['Source: Bursary, Topfaith University', myDate, searchP1, searchP2], 182, 14);
//     doc.addImage(this.logoImage, 'PNG', 10, 5, 26,26);
//     // doc.addImage(imageData, format, x, y, width, height, alias, compression, rotation)
//     doc.setFontSize(12);
//     doc.text(titleOfPdf ? titleOfPdf.toUpperCase() : '', 50, 44);
//     const headColumn: RowInput = [];
//     doc.setFontSize(8);
//
//     aList2.forEach(e=> {
//       headColumn.push(e.toUpperCase())
//       headColumn.push('')
//     })
//
//     headColumn.pop()
//     const alternative: { [key: number]: {} } = {}
//     // let columnsty = '{'
//     columnForMoney.forEach(e => {
//       // const temp = `${e}: {halign: 'right'}, `;
//       // columnsty = columnsty + temp;
//       const anE = (e + e )+"";
//       // console.log("key", anE)
//       eval(`alternative[${anE}] =  {halign: 'right'}`)
//       // alternative[`${e}`] = {halign: 'right'}
//     })
//     // const columnsty_new = columnsty.slice(0, -2) + '}'
//     // console.log({columnsty_new})
//     // console.log("alternative", alternative)
//
//     autoTable(doc,
//       { head: [headColumn],
//         body: prepare, startY: 48,
//         columnStyles: alternative,
//         //columnStyles: {10: {halign: 'right'}},
//         headStyles: { halign: 'center', cellPadding:2, fontSize:8},
//
//
//   })
//
//   // console.log({doc})
//
//
//
//     const filename = afileName + '.pdf';
//     doc.save(filename);
//   }
//
//
//
//   getStringDate(items: {year: number, month: number, day: number, hour: number, minute: number, second: number, nanosecond: number, timeZoneOffsetSeconds:number}): string{
//
//     const dateObject = new Date(Date.UTC(items.year, (items.month-1), items.day, items.hour, items.minute, items.second, items.nanosecond/ 1000000));
//
//     const timeZoneOffsetSeconds = 3600;
//     dateObject.setUTCMinutes(dateObject.getUTCMinutes() - timeZoneOffsetSeconds / 60);
//     // console.log('this dateobject::', dateObject)
//     return dateObject.toString();
//
//   }
//
//
// }
//
// export class RawUtil {
//
//   static getFormatedDate(aDateString: string) {
//     const d = new Date(aDateString);
//     const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
//     const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
//     const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
//     // const bb = d.toLocaleTimeString('en-GB');
//     const myDate = (`${da}/${mo}/${ye}`);
//     return myDate
//   }
//   static exportToExcel(dataID: any[], afileName: string, columnHeader: string [],option?: number) {
//   let timeSpan = new Date().toISOString();
//   let fileName = afileName || `ExportResult - ${timeSpan}`;
//   const header = columnHeader.filter(item => item != 'actions');
//
//   //
//   const prepare: any[][] = [];
//   const aDataNew: any[] = [];
//   dataID.forEach(
//     e => {
//     var tempObj: any[] = [];
//     for (let i=0; i < header.length ; i++){
//       const tempAnswer = (header[i])
//       eval(`tempObj.push(e.${tempAnswer ? tempAnswer : '' });`);
//
//     }
//
//     prepare.push(tempObj);
//   });
//   // console.log({prepare})
//   prepare.forEach(e => {
//     // console.log('this is e::::', e, e.length)
//     try {
//       let evalString = "aDataNew.push({";
//
//       for (let i = 0; i < e.length; i++) {
//         evalString = evalString + header[i] + " : '" + (e[i] ?  header[i].toLowerCase().includes('date') ? RawUtil.getFormatedDate(e[i]) : e[i].toString() : "") ;
//         if (i+1 === e.length) {
//           evalString = evalString + "'  });"
//         }
//         else {evalString = evalString + "' , "}
//       }
//       // console.log('\n\nEVALSTRING\n\n',evalString);
//       eval(`${evalString}`);
//     }
//     catch (e) {
//       console.log('Error @Excel Export::', e)
//     }
//
//   })
//
//   if (option === undefined)
//   {
//     let workbook = XLSX.utils.book_new();
//     let ws = XLSX.utils.json_to_sheet(aDataNew);
//
//     XLSX.utils.book_append_sheet(workbook, ws)
//
//     XLSX.writeFile(workbook, `${fileName}.xlsx`);
//   }
//   return aDataNew;
//
// }
// }
//
//



import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { KpClientService } from './kp-client.service';
import { TU_LOGO_IMAGE } from '../utilities/sharedFile';
import html2canvas from 'html2canvas'
import autoTable, { RowInput } from 'jspdf-autotable'// import JSPDF from 'jspdf';

// import { AddStaffComponent } from 'src/app/shared/components/dialogs/add-staff/add-staff.component';

import * as XLSX from "xlsx";

import jsPDF from 'jspdf'
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  isMessageFromMiniSales: BehaviorSubject<string> = new BehaviorSubject('');
  isMessageFromMiniSalesRestaurant: BehaviorSubject<string> = new BehaviorSubject('');
  isMessageStatus: BehaviorSubject<number> = new BehaviorSubject(0);
  marker: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  send2Regmarker: number = 1;

  matricStatus = 0;
  currentSessionStart = 0;
  logoImage = TU_LOGO_IMAGE;
  constructor(
    private snackBar: MatSnackBar,
    private kpClient: KpClientService,
    @Inject(LOCALE_ID) private locale: string

  ) {
    this.kpClient.getCurrentSessionMatricStatus().subscribe(
      data => {
        this.matricStatus = data ;
      }

    );

    this.kpClient.getCurrentSession().subscribe(
      data => {
        this.currentSessionStart = parseInt(data.split('/')[0]) ;
      }

    );
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action , {duration: 5000, });
  }



  getStringDate(items: {year: number, month: number, day: number, hour: number, minute: number, second: number, nanosecond: number, timeZoneOffsetSeconds:number}): string{

    const dateObject = new Date(Date.UTC(items.year, (items.month -1), items.day, items.hour, items.minute, items.second, items.nanosecond/ 1000000));

    const timeZoneOffsetSeconds = 3600;
    dateObject.setUTCMinutes(dateObject.getUTCMinutes() - timeZoneOffsetSeconds / 60);
    // console.log('this dateobject::', dateObject)
    return dateObject.toString();

  }



  // remove a String and replace
  prepareQuery(query: string, searchValue: string): string {
    const pieces = query.split(`"${searchValue}"`);
    return pieces.join(searchValue);
  }

  replaceText(query: string, searchValue: string, replaceValue: string): string {
    const pieces = query.split(`${searchValue}`);
    return pieces.join(replaceValue);
  }

  prepareNewID4(): string {
    const today = String(new Date());
    // console.log('date string: ', today);
    return today;
  }

  // this ID generator return a random id with a date prefix ie 2021130XXXXXXXX
  prepareNewID3(expectedDigits: number): string {
    const today = new Date();
    const todaysYear = (Number(today.getFullYear()) % 100);
    const todaysMonth = (Number(today.getMonth()) + 1);
    const todaysDay = (Number(today.getDate()));

    const randomNo = String(Math.floor(Math.random() * Math.floor(expectedDigits - 6)));
    let tempRef = String(todaysYear)
      +
      ((String(todaysMonth)).length < 2 ?
        ('0' + (String(todaysMonth))) : String(todaysMonth))
      +
      ((String(todaysDay)).length < 2 ?
        ('0' + (String(todaysDay))) : String(todaysDay));

    const tempRef2 = tempRef;
    for (let i = 0; i < (expectedDigits - (tempRef2.length + randomNo.length)); i++)
    {
      tempRef = tempRef +  '0';
    }
    return(tempRef + randomNo);


  }
  prepareNewID(originalString: string, expectedDigits: number): string {
    let answer = '';
    const tempUserID = Number(originalString) + 1;
    console.log ('THIS IS TEMPUSERID: ', tempUserID);
    answer += tempUserID;
    while (answer.length < expectedDigits) {
      answer = '0' + answer;

    }
    return answer;
  }


  //numenclature of university student number = 202100001
  prepareNewID2(
    originalStringwith2digitYear: string,
    expectedDigits: number): string {

    const answer =  Number(originalStringwith2digitYear);
    console.log('@prepareNewID2', originalStringwith2digitYear );
    let answer3 = (Number(answer)) % (1 * Math.pow(10, expectedDigits - 4)); // reference number

    console.log('@prepareNewID2-answer3', answer3 );

    const answer2 = Math.floor(Number(answer) / (1 * Math.pow(10, expectedDigits - 4))); // reference year
    console.log('@prepareNewID2-answer2-reference year', answer2 );

    const today = new Date();
    let todaysYear = (Number(today.getFullYear()));
    // correct for notMatriculated


    if (answer2 !== todaysYear) { // not the same year reference
      if (this.matricStatus || this.currentSessionStart === todaysYear) {
        answer3 = 0;
      }
      else { todaysYear -= 1}

    }
    const NewNo = String(answer3 + 1); // do the increment in ref
    let tempRef = String(todaysYear);
    const tempRef2 = tempRef;
    for (let i = 0; i < (expectedDigits - (tempRef2.length + NewNo.length)); i++)
    {
      tempRef = tempRef +  '0';
    }
    console.log('@prepareNewID2-result', (tempRef + NewNo) );

    return(tempRef + NewNo);
  }

  // this function c



  sliceTable(
    myIndex: number, paginator: MatPaginator, data: any[]): any[] {
    // console.log('INDEX: ', myIndex);
    // console.log('PAGE INDEX: ', paginator.pageIndex);
    // console.log('PAGE SIZE: ', paginator.pageSize);


    // console.log('INDEX: ', myIndex);

    const startIndex = paginator.pageIndex * paginator.pageSize;
    const myPosition = startIndex + myIndex;
    data.splice(myPosition,  1);
    // console.log('@SPLICE TABLE: ', startIndex, myPosition);

    return data; }


  generateSessionList(): BehaviorSubject<string[]> {
    const answer = [];
    const Answer2: BehaviorSubject <string[]> = new BehaviorSubject<string[]>([]);
    let seedYear = "2020";
    let seedYearInt = 2020;
    const aDate = new Date();
    const currentYear = aDate.getFullYear();
    let aYear = (currentYear) + 6;
    for (let i = 0 ; (i + seedYearInt) <= aYear ; i++ )
    {
      seedYearInt += 1

      answer.push(seedYear + "/" + (seedYearInt).toString());
      seedYear = (seedYearInt).toString();

    }
    Answer2.next(answer);
    return Answer2;
  }
  getMyPositionOnTable(myIndex: number, paginator: MatPaginator): number {
    const startIndex = paginator.pageIndex * paginator.pageSize;
    const myPosition = startIndex + myIndex;
    return myPosition;
  }

  setSalesMarker(aPaymentType: string): void {
    this.isMessageFromMiniSales.next(aPaymentType);

  }

  setSalesMarkerRestaurant(aPaymentType: string): void {
    this.isMessageFromMiniSalesRestaurant.next(aPaymentType);

  }

  setMessageStatus(aStatus: number): void {
    this.isMessageStatus.next(aStatus);
  }



  exportToPdf(anArray: any[], afileName: string, aList: string[], searchP?: string, titleOfPdf?: string) {
    let prepare: any[] = [];
    const columnForMoney: number[] = []
    const dateList: number[] = [];
    for (let i = 0; i < aList.length; i++) {
      if (aList[i].toLowerCase().includes('date') || aList[i].toLowerCase().includes('dob')) {dateList.push(i)}
    }
    const aList2 = aList.filter(item => item != 'actions');
    anArray.forEach(
      e => {
        var tempObj = [];

        for (let i=0; i < aList2.length ; i++){
          let toPush = false;
          let tempAnswer = (aList2[i])
          if (dateList.includes(i)) {
            toPush = true;
          }
          if (toPush) {
            // eval(`tempObj.push( formatDate(new Date( e.${tempAnswer}), 'yyyy-MM-dd', this.locale));`);
            toPush = false;
            let temp = ' '
            eval(`temp = e.${tempAnswer}`)
            // console.log('TEMP:::', temp);
            const dateAnswer = temp ? RawUtil.getFormatedDate(temp)  : temp;
            tempObj.push(dateAnswer);

          }
          else {
            if (tempAnswer.toLowerCase() === 'cr' || tempAnswer.toLowerCase() === 'dr'
              || tempAnswer.toLowerCase() === 'balance') {
              let temp = ''
              eval(`temp = e.${tempAnswer}`)
              const MoneyAnswer = temp ? parseFloat(temp).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : ''
              tempObj.push(MoneyAnswer);
              if(!columnForMoney.includes(i)) {columnForMoney.push(i);}

            }else

            {
              // eval(`tempObj.push(e.${tempAnswer});`);
              eval(`tempObj.push(e.${tempAnswer ? tempAnswer : ' ' });`);

            }
          }
          tempObj.push('');
        }

        prepare.push(tempObj);
      });
    let searchP1 = ''
    let searchP2 = ''
    const countSearch = searchP ? searchP.split(',') : [];
    if (countSearch.length > 0)
    {
      for (let i = 0; i < countSearch.length; i++) {
        if (i % 2 !== 0) {searchP1 += (countSearch[i] + ' ');}
        else {searchP2 += (countSearch[i]+ ' ');}
      }
      searchP1.trim();
      searchP2.trim();
    }
    const doc = new jsPDF({
      orientation: "landscape"

    });

    const d = new Date();
    const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
    const bb = d.toLocaleTimeString('en-GB');
    const myDate = (`Date: ${da}/${mo}/${ye} ${bb} `);
    doc.text("TOPFAITH UNIVERSITY, MKPATAK", 50, 15);
    doc.text("AKWAIBOM STATE", 50, 25);
    doc.rect(180, 4, 110, 28);
    doc.text("Report Parameters", 182, 10);
    doc.setFontSize(9);
    doc.text(['Source: Bursary, Topfaith University', myDate, searchP1, searchP2], 182, 14);
    doc.addImage(this.logoImage, 'PNG', 10, 5, 26,26);
    // doc.addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    doc.setFontSize(12);
    doc.text(titleOfPdf ? titleOfPdf.toUpperCase() : '', 50, 44);
    const headColumn: RowInput = [];
    doc.setFontSize(8);

    aList2.forEach(e=> {
      headColumn.push(e.toUpperCase())
      headColumn.push('')
    })

    headColumn.pop()
    const alternative: { [key: number]: {} } = {}
    // let columnsty = '{'
    columnForMoney.forEach(e => {
      // const temp = `${e}: {halign: 'right'}, `;
      // columnsty = columnsty + temp;
      const anE = (e + e )+"";
      // console.log("key", anE)
      eval(`alternative[${anE}] =  {halign: 'right'}`)
      // alternative[`${e}`] = {halign: 'right'}
    })
    // const columnsty_new = columnsty.slice(0, -2) + '}'
    // console.log({columnsty_new})
    // console.log("alternative", alternative)

    autoTable(doc,
      { head: [headColumn],
        body: prepare, startY: 48,
        columnStyles: alternative,
        //columnStyles: {10: {halign: 'right'}},
        headStyles: { halign: 'center', cellPadding:2, fontSize:8},


      })

    // console.log({doc})



    const filename = afileName + '.pdf';
    doc.save(filename);
  }






}

export class RawUtil {

  static getFormatedDate(aDateString: string) {
    const d = new Date(aDateString);
    const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
    // const bb = d.toLocaleTimeString('en-GB');
    const myDate = (`${da}/${mo}/${ye}`);
    return myDate
  }

  static getEmmyDate(aDOB: Date) {
    const b = new Date(aDOB).toLocaleDateString('en-GB', {timeZone: 'Africa/Lagos'}).split('/');
    // console.log('new Date::', new Date(+b[2],+b[1]-1, +b[0]) )
    return new Date(+b[2],+b[1]-1, +b[0])
  }
  static exportToExcel(dataID: any[], afileName: string, columnHeader: string [],option?: number) {
    let timeSpan = new Date().toISOString();
    let fileName = afileName || `ExportResult - ${timeSpan}`;
    const header = columnHeader.filter(item => item != 'actions');

    //
    const prepare: any[][] = [];
    const aDataNew: any[] = [];
    console.log({dataID})
    console.log({header})
    dataID.forEach(
      e => {
        var tempObj: any[] = [];
        for (let i=0; i < header.length ; i++){

          let tempAnswer = (header[i])
          if(header[i].toLowerCase().includes('status')) {tempAnswer = 'activeStatus'}
          eval(`tempObj.push(e.${tempAnswer ? tempAnswer : ' ' });`);

        }

        prepare.push(tempObj);
      });
    // console.log({prepare})
    prepare.forEach(e => {
      // console.log('this is e::::', e, e.length)
      try {
        let evalString = `aDataNew.push({`;

        for (let i = 0; i < e.length; i++) {
          // evalString = evalString + header[i] + " : '" +
          // (e[i] ?  header[i].toLowerCase().includes('date') ? RawUtil.getFormatedDate(e[i])
          // : (header[i].toLowerCase().includes('status') ? '1' : e[i].toString() ) : " ") ;
          // if (i+1 === e.length) {
          //   evalString = evalString + "'  });"
          // }
          // else {evalString = evalString + "' , "}

          // //////////////////////////////////////////////////////////////////////////
          evalString = evalString + header[i] + ` : "`;
          if (e[i]) {
            if (header[i].toLowerCase().includes('date')) {
              evalString += RawUtil.getFormatedDate(e[i])
            }

            else if(header[i].toLowerCase().includes('status')) {
              // console.log('status0::', e[i])
              // console.log('status1::', e[i].toString())
              evalString += '1';
            }
            else if(header[i].toLowerCase().includes('name')) {
              let nameJoin = ""
              const nameBreak = e[i].split("'")
              for (let j = 0; j < nameBreak.length; j++){
                if (j + 1 == nameBreak.length) {nameJoin += nameBreak[j]}
                else {nameJoin = nameJoin + nameBreak[j] + `\'`}
              }
              evalString += nameJoin;
            }
            else { evalString += e[i].toString()}
          }
          else { evalString += " "}
          if (i+1 === e.length) {
            evalString = evalString + `"  });`
          }
          else {evalString = evalString + `" , `}
          // //////////////////

        }
        // console.log('\n\nEVALSTRING\n\n',evalString);
        // Function(evalString)
        eval(`${evalString}`);

      }
      catch (e) {
        console.log('Error @Excel Export::', e)
      }

    })
    // console.log({aDataNew})
    if (option === undefined)
    {
      let workbook = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(aDataNew);

      XLSX.utils.book_append_sheet(workbook, ws)

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
    return aDataNew;

  }
}
