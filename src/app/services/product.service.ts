import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { KLoginService } from './klogin.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private angularS1: KLoginService) { }

  getProducts(): AsyncSubject<Product[]>  {
    const userList: AsyncSubject<Product[]> = new AsyncSubject();

    const DishList: Product[] = [];
    const query = 'match (a:StudentProduct) return  a order by a.prodCode';
    const answer = [];
    // this.angularS1.doConnect();

//     this.angularS1.angularS.run(query).then((res: any) => {
//     for (const r of res) {
//   // console.log('AT MENU: ', r);
//   DishList.push(r[0].properties as Product);
//     }
//     userList.next(DishList);
//     userList.complete();
// // console.log('at service: ', this.RoomList);


// },
// () => {});


this.angularS1.queryDB(query,'2')
.subscribe((data) => {
  if (data) {
    for (var i = 0; i < data.results.length; i++) {
      DishList.push(data.results[i] as Product);
    }
    userList.next(DishList);
    userList.complete();

  }
});
    return userList;

  }

  getProductPrice(productCode: string): AsyncSubject<number>  {
    const userList: AsyncSubject<number> = new AsyncSubject();

    //const DishList: Product[] = [];
    const query = `
    match (a:StudentProduct) where a.prodCode = '${productCode}' return  a.price`;
    let answer = 0;
    // this.angularS1.doConnect();

//     this.angularS1.angularS.run(query).then((res: any) => {
//     for (const r of res) {
//   // console.log('AT MENU: ', r);
//       answer = (r[0]);
//     }
//     userList.next(answer);
//     userList.complete();
// },
// () => {});

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = (data.results[i][0]);
          // console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        userList.next(answer);
        userList.complete();
      });
    return userList;

  }

  async getProductPrice2(productCode: string)  {
    const userList: AsyncSubject<number> = new AsyncSubject();

    //const DishList: Product[] = [];
    const query = `
    match (a:StudentProduct) where a.prodCode = '${productCode}' return  a.price`;
    let answer = 0;
    // this.angularS1.doConnect();

//     await this.angularS1.angularS.run(query).then((res: any) => {
//     for (const r of res) {
//   // console.log('AT MENU: ', r);
//       answer = (r[0]);
//     }
//     userList.next(answer);
//     userList.complete();
// // console.log('at service: ', this.RoomList);
//
//
// },
// () => {});

    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = (data.results[i][0]);
          // console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        userList.next(answer);
        userList.complete();
      });
    return answer;

  }

  editProduct(aUser: Product ): BehaviorSubject<boolean> {
    const answerEditUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    let query = `merge (n:StudentProduct{prodCode:"${aUser.prodCode}"})`;
    query += (aUser.description ? `set n.description = "${aUser.description}"` : '');
    query += (aUser.price ? `set n.price= ${aUser.price} ` : 0.0);
    query += (aUser.notDefault ? `set n.notDefault= ${aUser.notDefault} ` : '');

    query += `return 1`;

    console.log('EDIT PRODUCT: ', query);
    // this.angularS1.doConnect();
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   console.log('EDIT PRODUCT: ', res);
    //   answerEditUser.next(true);
    //   });
    let answer = 0;

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = (data.results[i][0]);
          // console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answerEditUser.next(answer ? true : false);
      });

    return answerEditUser;

  }

  deleteProduct(aUser:Product ): BehaviorSubject<boolean> {
    const answerEditUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    let query = `match (n:StudentProduct{prodCode:"${aUser.prodCode}"}) where `;
    const tempQ = query;
    query += (aUser.creationStamp ? `n.creationStamp = "${aUser.creationStamp}"` : '');
    // query += (aUser.price ? `set n.price= ${aUser.price} ` : 0.0);
    const check = query=== tempQ ? true : false;
    query += (aUser.notDefault && check ? `n.notDefault= ${aUser.notDefault} ` : '');
    query += (aUser.notDefault && !check ? ` and n.notDefault= ${aUser.notDefault} ` : '');
    query += ` detach delete n return 1`;

    console.log('DELETE PRODUCT: ', query);
    // this.angularS1.doConnect();
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   console.log('DELETE PRODUCT: ', res);
    //   answerEditUser.next(true);
    //   });
    //
    let answer = 0;

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = (data.results[i][0]);
          // console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answerEditUser.next(answer ? true : false);
      });


    return answerEditUser;

  }

  createProduct(
    aUser: Product): AsyncSubject<boolean> {
    const answerCreateUser: AsyncSubject<boolean> = new AsyncSubject<boolean>();


    const query = `merge (n:StudentProduct{prodCode: toUpper("${aUser.prodCode}")})
    set n.price = ${aUser.price ? aUser.price : 0.0 }
    set n.description="${aUser.description ? aUser.description : ''}"
    set n.notDefault = true
    set n.creationStamp= toString(datetime({timezone:'+01:00'}))
    return 1
    `;

    console.log('CREATE PRODUCT: ', query);
    // this.angularS1.doConnect();
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   console.log('CREATE PRODUCT: ', res);
    //   answerCreateUser.next(true);
    //   answerCreateUser.complete();
    //   });
    let answer = 0;

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = (data.results[i][0]);
          // console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answerCreateUser.next(answer ? true : false);
      });

    console.log('CREATE PRODUCT- Answer ASubject: ', answerCreateUser);

    return answerCreateUser;
  }



}
