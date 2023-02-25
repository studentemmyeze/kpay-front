import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { StorageKey, StorageKey2 } from '../interfaces/storage-key';
import { User } from '../interfaces/user';
import { KLoginService } from './klogin.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';
const { AUTH_TOKEN } = StorageKey;
const { AUTH_LEVEL } = StorageKey2;
// const { AUTH_NAME } = StorageKey3;
// const { AUTH_LOGINID } = StorageKey4;






@Injectable({
  providedIn: 'root'
})
export class UserService {

  endpoint = 'auth';
  token: string; // user ID
  token2 = ''; // level
  loginNodeID = '';
  nameToken = ''; // user full name
  isManager = false;
  isAdmin = false;

  redirectUrl = '';
  public answerCreateUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(
    public angularS1: KLoginService, private storage: StorageService,
    public utilityService: UtilityService) {
    // this.angularS1.doConnect();
    this.token = this.storage.read(AUTH_TOKEN) || '';

    const tempToken = this.storage.read2(AUTH_LEVEL) || '';
    this.splitFunction(tempToken);


  }

  public splitFunction(joinBulk: string): void {
    // console.log('IN SPLIT- userservice');
    let bulkSplitList = joinBulk.split('$$$');
    bulkSplitList = (bulkSplitList.length > 2 ? bulkSplitList : ['', '', '']);
    this.token2 = bulkSplitList[0];
    this.nameToken = bulkSplitList[1];
    this.loginNodeID = bulkSplitList[2];


  }

  authenticateUSer(): void {

  }

  getLoginNodeID(): string {
    return this.loginNodeID;
  }

  createUser(
    aUser: User): void {
    // 'FRONTDESK USER', 'FRONTDESK MANAGER', 'RESTAURANT USER',
    // 'RESTAURANT MANAGER', 'GENERAL MANAGER', 'ADMINISTRATOR'

    const query = `merge (n:User{staffID:"${aUser.staffID}"})
    set n.fName = "${aUser.fName}"
    set n.lName="${aUser.lName}"
    set n.password = "${aUser.password}"
    set n.permission="${aUser.permission}"
    set n.staffID_in = '${aUser.staffID_in}'
      set n.isActive = true
    set n.createStamp= toString(datetime({timezone:'+01:00'}))
    return 1
    `;

    // console.log('CREATE USER: ', query);
    this.angularS1.doConnect();
    this.angularS1.angularS.run(query).then((res: any) => {
      // console.log('CREATE USER: ', res);
      this.answerCreateUser.next(true);
      });

    // console.log('CREATE GUEST- Answer ASubject: ', this.answerCreateUser);
  }

  editUser(aUser:User ): BehaviorSubject<boolean> {
    const answerEditUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    let query = `merge (n:User{staffID:"${aUser.staffID}"})`;
    query += (aUser.fName ? `set n.fName = "${aUser.fName}"` : '');
    query += (aUser.lName ? `set n.lName="${aUser.lName}" ` : '');
    query += (aUser.password ? `set n.password = "${aUser.password}" ` : '');
    query += (aUser.permission ? `set n.permission = "${aUser.permission}" ` : '');
    query += (aUser.isActive ? `set n.isActive = ${aUser.isActive} ` : '');

    query += `return 1`;

    // console.log('EDIT USER: ', query);
    this.angularS1.doConnect();
    this.angularS1.angularS.run(query).then((res: any) => {
      // console.log('EDIT USER: ', res);
      answerEditUser.next(true);
      });

    return answerEditUser;

  }

  getUsers(): AsyncSubject<User[]>  {
    const userList: AsyncSubject<User[]> = new AsyncSubject();

    const DishList: User[] = [];
    const query = 'match (a:User) return  a order by a.staffID';
    const answer = [];
    this.angularS1.doConnect();

    this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
  // console.log('AT MENU: ', r);
  DishList.push(r[0].properties);
    }
    userList.next(DishList);
    userList.complete();
// console.log('at service: ', this.RoomList);


},
() => {});
    return userList;

  }


  getUser(): string {
    return this.token;
  }

  getUserName(): string { return this.nameToken; }

  getManager(): string {
    return 'MR0008';
  }

  getUserList(): User[] {
    const aUserList: User[] = [];
    return aUserList;
  }


    public makeLogin(
      currentUser: string, // the user to be handed over to
      handOffUser?: string, // the user that is leaving
      handOffUserLoginID?: string, // the Login Node ID of the user that is leaving
      handOffList?: string[]): AsyncSubject<boolean> {
        const currentLoginID = this.utilityService.prepareNewID4();
        const Answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

        this.loginNodeID = currentLoginID;
        let query = `
        match(b: User {staffID: '${currentUser}'})
        create (a:Login
          {loginID: '${currentLoginID}',
        inStamp: datetime({timezone:'+01:00'})})-[:LOGINAS]->(b)
        `;
        if (handOffUser) {
          const handOverID = this.utilityService.prepareNewID4();

          const tempList = [];
          if (!handOffList) {handOffList = [];}

          // let query = '';
          for ( let i = 0; i < handOffList.length; i++) {
              tempList.push(`"${handOffList[i]}"`);
            }




          query += `
          with a
          match(aa: Login {loginID: '${handOffUserLoginID}'})
          MERGE(x:HandOver{handOverID:"${handOverID}"})`;
          query += (tempList.length > 0 ? `set x.items= ${tempList}` : '');
          query += ` create (aa)-[h:HANDOVERTO]->(x)-[:HANDOVERFOR]->(a)
          `;
        }
        query += ' return true';
        let answer = false;
        // console.log('MAKE LOGIN: ', query);
        this.angularS1.angularS.run(query).then((res: any) => {
      for (const r of res) {
        // console.log('AT SIGNIN-R, ', r);
        answer = r[0];
      }
      Answer.next(answer);
      Answer.complete();

    });

        return Answer;


      }

    public makeLogout(): AsyncSubject<boolean> {
      // const currentLoginID = this.utilityService.prepareNewID4();
      const Answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

      // this.loginNodeID = currentLoginID;
      const query = `
      match(b: Login {loginID: '${this.loginNodeID}'})
       set b.outStamp = datetime({timezone:'+01:00'})
       return true
      `;
      let answer = false;
      // console.log('MAKE LOGOUT: ', query);
      this.angularS1.doConnect();

      this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
      // console.log('AT SIGNIN-R, ', r);
      answer = r[0];
    }
    Answer.next(answer);
    Answer.complete();
  });

      return Answer;
    }

  public signIn(
    username: string,
    password: string, handOffUser?: string,
    handOffUserLoginID?: string, handOffList?: string[] ): AsyncSubject<boolean> {

    const Answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();
    const query = `match (a:User) where a.staffID = '${username}'
    and a.isActive = true
    return a.password, a.permission, a.lName, a.fName`;
    let answer = '';
    let answer2 = '';
    let answer3 = '';
    let answer4 = '';
    let toReturn = false;

    // console.log('GET LOGIN QUERY: ', query);
    this.angularS1.doConnect();
    this.angularS1.loginAnswer.subscribe((response) => {
      if (response) {

        this.angularS1.angularS.run(query).then((res: any) => {

          for (const r of res) {
            console.log('AT SIGNIN-R, ', r);
            alert(r)
            answer = r[0];
            answer2 = r[1];
            answer3 = r[2];

            answer4 = r[3];


          }

          if (answer === password)
            {
              this.token = username; //
              this.token2 = answer2; // permission
              this.nameToken = answer3 + ' ' + answer4; // name

              this.makeLogin(username, handOffUser,
                handOffUserLoginID, handOffList)
                .subscribe((data) => {
                  if (data) {
                    const tempToSave  = this.token2 + '$$$' + this.nameToken
                    + '$$$' + this.loginNodeID;
                    this.storage.save(StorageKey.AUTH_TOKEN, this.token);
                    this.storage.save2(StorageKey2.AUTH_LEVEL, tempToSave);
                    // this.storage.save2(StorageKey2.AUTH_LEVEL, this.token2);
                    // this.storage.save3(StorageKey3.AUTH_NAME, this.nameToken);
                    // this.storage.save4(StorageKey4.AUTH_LOGINID, this.loginNodeID);


                    // console.log('AT GET LEVEL: ', this.getLevel());
                    const level = this.getLevel();
                    const mTest = (/MANAGER/i).test(level);
                    this.isManager =  (mTest ? true : false);
                    const adTest = (/ADMINISTRATOR/i).test(level);
                    this.isAdmin =  (adTest ? true : false);
                    toReturn =  true;
                    // console.log('TO RETURN VALUE: ', toReturn);
                    Answer.next(toReturn);
                    Answer.complete();

                  }
                  // else { toReturn = false; }
                });
            }


          });



      }
    })

    return Answer;
  }

  public getAdminStatus(): boolean {
    const tempToken = this.storage.read2(AUTH_LEVEL) || '';
    this.splitFunction(tempToken);
    // console.log('AT GET LEVEL: ', this.getLevel());
    const level = this.getLevel();
    const mTest = (/MANAGER/i).test(level);
    this.isManager =  (mTest ? true : false);
    const adTest = (/ADMINISTRATOR/i).test(level);
    this.isAdmin =  (adTest ? true : false);
    return this.isAdmin;
  }
  public getManagerStatus(): boolean { return this.isManager; }

  public getToken(): string {
    return this.token;
}
  public getLevel(): string {
  return this.token2;
}
// public async logout_old(): Promise<boolean> {
//     let answer = false;
//     await this.makeLogout().then((data) => {
//       if (data) {
//         this.token = '';
//         this.token2 = '';
//         this.loginNodeID = '';
//         this.nameToken = '';
//         this.storage.remove(AUTH_TOKEN);
//         this.storage.remove2(AUTH_LEVEL);
//         // this.storage.remove3(AUTH_NAME);

//         // this.storage.remove4(AUTH_LOGINID);

//         // this.storage.clear();
//         answer = true;
//       }
//     });
//     return answer;

// }

public logout(): AsyncSubject<boolean> {
  let answer = false;
  const Answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

  this.makeLogout().subscribe((data) => {
    {
      this.token = '';
      this.token2 = '';
      this.loginNodeID = '';
      this.nameToken = '';
      this.storage.remove(AUTH_TOKEN);
      this.storage.remove2(AUTH_LEVEL);
      // this.storage.remove3(AUTH_NAME);

      // this.storage.remove4(AUTH_LOGINID);

      // this.storage.clear();
      answer = true;
      Answer.next(answer);
      Answer.complete();
    }
  });
  return Answer;

}

public async logout1(): Promise<boolean> {//Promise<boolean> {
  let answer = false;
  // await this.makeLogout().then((data) => {
  //   if (data) {
  this.token = '';
  this.token2 = '';
  this.loginNodeID = '';
  this.nameToken = '';
      // this.storage.remove(AUTH_TOKEN);
      // this.storage.remove2(AUTH_LEVEL);
  this.storage.clear();
  answer = true;
  //   }
  // });
  return answer;

}

public isLogged(): boolean {
    return this.token.length > 0;
}

  getUserMaxId(): BehaviorSubject<string> {
    const MaxRm: BehaviorSubject<string> = new BehaviorSubject<string>('');
    const query = 'match (a:User) return  max(a.staffID)';
    let answer = '';
    this.angularS1.doConnect();
    this.angularS1.angularS.run(query).then((res: any) => {
      for (const r of res) {
        answer = r[0];
      }

      MaxRm.next(answer);


      });
    return MaxRm;



}

checkUserExists(aUserName: string): BehaviorSubject<boolean> {
  const MaxRm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  const query = `match (a:User) where a.staffID = '${aUserName}' return true`;
  let answer = false;
  this.angularS1.doConnect();
  this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
      answer = r[0];
    }

    MaxRm.next(answer);


    });
  return MaxRm;
}
checkUserExists2(aUserName: string): boolean {
  // const MaxRm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  const query = `match (a:User) where a.staffID = '${aUserName}' return true`;
  let answer = false;
  this.angularS1.doConnect();
  this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
      answer = r[0];
    }

    // MaxRm.next(answer);


    });
  return answer;
}

getPassword(aUserName: string): BehaviorSubject<string> {
  const MaxRm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  const query = `match (a:User) where a.staffID = '${aUserName}' return a.password`;
  let answer = '';
  this.angularS1.doConnect();
  this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
      answer = r[0];
    }

    MaxRm.next(answer);


    });
  return MaxRm;
}

getPassword2(aUserName: string): string {
  // const MaxRm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  const query = `match (a:User) where a.staffID = '${aUserName}' return a.password`;
  let answer = '';
  this.angularS1.doConnect();
  this.angularS1.angularS.run(query).then((res: any) => {
    for (const r of res) {
      answer = r[0];
    }

    // MaxRm.next(answer);


    });
  //console.log('AT GET PASSWORD: ', answer);
  return answer;
}

}

