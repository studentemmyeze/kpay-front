import { HttpClient, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularNeo4jService } from 'angular-neo4j';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KLoginService {
  loginSuccess = false;
  driverArray = [];
  constructor(public angularS: AngularNeo4jService, private http: HttpClient) {
    // const url = environment.loginUrl;
    // fetch(url || '', {mode: 'no-cors'})
    // .then(() => {
    //   this.loginSuccess = true;
    // })
    // .catch(() => {this.loginSuccess = false; });

  }

  // doConnect(): void {
  //   const url2 = environment.loginUrl2;
  //   const url = environment.loginUrl;
  //   const username = 'neo4j';
  //   const password = 'etimbuk12';
  //   const encrypted = true;
  //     if (this.loginSuccess) {
  //       this. angularS
  //           .connect(
  //             url,
  //             username,
  //             password,
  //             encrypted
  //           )
  //           .then(driver => {
  //             if (driver) {
  //               console.log(`Successfully connected to ${url}`);
  //
  //             }
  //           });
  //     }
  //     else {
  //       this. angularS
  //           .connect(
  //             url2,
  //             username,
  //             password,
  //             encrypted
  //           )
  //           .then(driver2 => {
  //             if (driver2) {
  //               console.log(`Successfully connected to ${url2}`);
  //             }
  //           });
  //
  //     }
  //
  //   // })
  //
  //
  // }
  // doDisConnect(): void {
  //   this.angularS.disconnect();
  // }

  queryDB(query: string, option: string): Observable<any> {
    let queryParams = new HttpParams();

    queryParams = queryParams.append('queries', encodeURIComponent(query) );
    queryParams = queryParams.append('option', option );

    return this.http.get<{results: any[], message: any, status: number}>(`${environment.neo4jAPI}/api/db-read`,
      {params: queryParams})
    .pipe(
      tap(_ => {
        console.log (`fetched the query:: ${query}`);
        // console.log({_});

      }),
      catchError(this.handleError<any>(`Issues with the query::${query}`, undefined)));
    // this.http.get<{results:any[],message:any, status:number}>(`http://localhost:3000/api/db-read`,{params:queryParams})

  }

  writeDB(query: string, option: string): Observable<any> {
    let queryParams = new HttpParams();

    queryParams = queryParams.append( 'queries', encodeURIComponent(query) );
    queryParams = queryParams.append('option', option );

    return this.http.get<{results: any[], message: any, status: number}>(`${environment.neo4jAPI}/api/db-write`,
      {params: queryParams})
    .pipe(
      tap(_ => console.log (`fetched the write query:: ${query}`)),
      catchError(this.handleError<any>(`Issues with the write query::${query}`, undefined)));
    // this.http.get<{results:any[],message:any, status:number}>(`http://localhost:3000/api/db-read`,{params:queryParams})

  }


  // tslint:disable-next-line:typedef
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }




  }
