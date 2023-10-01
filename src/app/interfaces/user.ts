export interface User {
  staffID: string;
  lName: string;
  fName: string;
  password: string;
  permission: string;
  isActive: boolean;
  staffID_in: string; // staff that created this user
  createStamp?: Date;


}

export interface SessionInfo {
  semesterNo: number;
  sessionNo: number;
  session: string;
  sDate: Date;
  eDate: Date;
  // isActive: boolean;
  // staffID_in: string; // staff that created this user
  // createStamp?: Date;


}


export interface Bank {
  bankCode: string;
  color: number;
  shortName: string;
  longName: Date;


}

export interface ApprovedBank {
  color: number;
  accountNo: string;
  longName: string;
}
