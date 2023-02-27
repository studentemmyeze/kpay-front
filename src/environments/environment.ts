// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000',
  loginUrl: 'http://localhost:7474',
  loginUrl2: 'http://localhost:7474',
  // loginUrl2: 'http://192.168.92.222:7474',
  dropboxKEY: 'pd8hvwf9oc0zpfg',
  dropboxUrl: 'http://localhost:4200/nav/studentinfo',
  // neo4jAPI: 'http://localhost:3000',
  neo4jAPI: 'https://kpay-api.onrender.com',

  dropboxToken: '' ,
  send2Reg: false,
  authSuccess: false

};



// export const environment = {
//   production: false,
//   apiUrl: process.env.apiUrl,
//   loginUrl: process.env.loginUrl,
//   loginUrl2: process.env.loginUrl2,
//   // loginUrl2: 'http://192.168.92.222:7474',
//   dropboxKEY: process.env.dropboxKEY,
//   dropboxUrl: process.env.dropboxUrl,
//   // neo4jAPI: 'http://localhost:3000',
//   neo4jAPI: process.env.neo4jAPI,
//   dropboxToken: '' ,
//   send2Reg: false,
//   authSuccess: false
//
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
