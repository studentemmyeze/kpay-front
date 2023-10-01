
export interface Student {
  studentNo: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dOB: Date; // consider making this a date format
  gender: string;
  level: number;
  nin?: string;

  activeStatus: boolean;
  studentType: number; // 1 undergrad, 2 direct entry, 3 pgd 4 msc 5 phd 6 jupeb
  email?: string;
  phone: string;
  address?: string;
//     applicationNo: string;
  // department: string;

  programme: string;
  isDeleted: boolean;
  staffIn?: string;
  religion?: string;

//     endDate?: Date;
  creationStamp?: string | null;
  maritalStatus?: string;
  maidenName?: string | null;
  state?: string;
  nationality?: string;
}

export interface StudentGuardian {
  studentNo: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dOB: Date; // consider making this a date format
  gender: string;
  level: number;
  nin?: string;

  activeStatus: boolean;
  studentType: number; // 1 undergrad, 2 direct entry, 3 pgd 4 msc 5 phd 6 jupeb
  email?: string;
  phone: string;
  address?: string;
//     applicationNo: string;
  // department: string;
  programme: string;

  isDeleted: boolean;
  staffIn?: string;
  religion?: string;

//     endDate?: Date;
  creationStamp?: string | null;
  maritalStatus?: string;
  maidenName?: string | null;
  state?: string;
  nationality?: string;
  guardian1_name?: string;
  guardian1_address?: string;
  guardian1_email?: string;
  guardian1_phone?: string;
  guardian1_relationship?: string;

  guardian2_name?: string;
  guardian2_address?: string;
  guardian2_email?: string;
  guardian2_phone?: string;
  guardian2_relationship?: string;

  sponsor_name?: string;
  sponsor_address?: string;
  sponsor_email?: string;
  sponsor_phone?: string;
  sponsor_relationship?: string;
}

export interface TempStudent{
  studentNo: string;
  creationStamp: string;
}

export interface Study {
  beginDate: Date;
  beginSession: string;
  finishSession: string;
  studentType: number; // 1 undergrad, 2 direct entry, 3 pgd 4 msc 5 phd 6 jupeb
  // department: string;
  programme: string;

  applicationNo?: string;
  status: string // ongoing, completed, abandoned
  jambNo?: string;
  finishDate?: Date;
  certificateDate?: String;
  creationStamp: string;
  staffIn: string;
  IsDeleted: boolean;

}

export interface StudentType {
  stName: string;
  code: string;
  sNo: number;
}

export interface SponsorDetails {

  fullName: string;

  accountNumber?: string;
  accountName?: string;
  relationship?: string;
  bank?: string;
  creationStamp: string;
  title?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  address?: string;

}

export interface NextKin {

  title?: string;
  fullName: string;
  relationship?: string;
  occupation?: string;
  email?: string;
  phone: string;
  address?: string;
  creationStamp: Date;



}

// ugResumptionDateList: Date[];
// ugFinishDate: Date;
// pg1ResumptionDateList: Date[];
// pg1FinishDate: Date;
// pg2ResumptionDateList: Date[];
// pg2FinishDate: Date;

// dateStatus: number;


export interface Applications {
  nationality: string;
  dateCreated: Date;
  firstName: string;
  middleName: string;
  lastName: string;
  dOB: Date; // consider making this a date format
  gender: string;
  nin: string;
  maritalStatus: string;
  religion?: string;
  status: boolean;
  email: string;
  phone: string;
  address: string;
  state: string;
  applicationNo: string;
  jambNo: string;
  department1: string;
  department2: string;
  guardians1: NextKin;
  guardians2: NextKin;
  beginSession: string;
  bloodGroup: string;
  disability: boolean;

}

export interface StudentLedgerEntry {
  datePosted: Date;
  session: string;
  semester: number;
  product: string;
  qty: number;

  dr: number | string;
  cr: number | string;
  balance: number | string;
  details: string;

  paymentMode: string;
  bank: string;
  tellerDate: Date;
  tellerNo: string;
  receiptNo: string;
  depositor: string;
  staffIn: string;
}

export interface Concession{
  sCode: string;
  description: string;
  sponsor: string;
}


export interface StudentProduct {
  prodCode: string;
  description: string;
  price: number;
}

export interface LedgerInfo {
  datePostedList: Date[];
  tellerDateList: Date[];
  session: string;
  semester: number;
  product: string;
  transacType: number | string; //transaction type ie debit or credit or both 1,2,3
  balance: number;
  details: string;
  sType: string; // student type ie undergrad
  studyStatus: string; // applicant, ongoing
  paymentMode: string; //concession, cash, etc
  bank: string;

  tellerNo: string;
  receiptNo: string;
  studentNo: string;
  staffIn: string;
  amount: number;
  paidSign: string;
  level: number;
  gender: string;

}

export interface AdvPostingInfo {

  session: string;
  semester: number;
  product: string;
  transacType: number | string; //transaction type ie debit or credit or both 1,2,3
  details: string;
  sType: string; // student type ie undergrad
  studyStatus: string; // applicant, ongoing
  paymentMode: string; //concession, cash, etc
  studentNo: string;
  staffIn: string;
  amount: number;
  level: number;
  gender: string;
  // department: string;
  programme: string;

  faculty: string;

}


export interface OutstandingInfoData{
  aStudent: Student;
  studentNo: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: string;
  balance: number;
  // department: string;
  programme: string;

  level: number;
  status: string;
}

export interface BillInfoData{
  studentNo: string;
  lastName: string;
  firstName: string;
  middleName: string;
  datePosted: Date;
  details: string;
  cr: number ; // | string;
  dr: number ; //| string;
  balance: number ; //| string;
  // department: string;
  programme: string;

  level: number | string;
  status: string; //applicant or not
}


export interface OutstandingInfo {
  dateToLookAt: Date;
  paidSign: string;
  gender: string;
  amount:number;
  level: number;
  // department:string;
  programme: string;

  faculty: string;
  status: number |string;

}

export interface BillInfo {
  dateToLookAt: Date;
  session: string;
  gender: string;
  studentNo: string;
  level: number;
  // department:string;
  programme: string;

  balance: number;
  status: number |string;
  includeApplicants: boolean;
  faculty: string; // faculty code


}
export interface StudentLedgerEntryMax {
  datePosted: Date;
  session: string;
  semester: string;
  qty: number;

  dr: number;
  cr: number;
  balance: number;
  details: string;

  paymentMode: string;
  bank: string;
  tellerDate: Date;
  tellerNo: string;
  receiptNo: string;
  depositor: string;
  staffIn: string;
  studentNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  level: number;
  product: string;
  activeStatus: boolean;
  studentType: number; // 1 undergrad, 2 direct entry, 3 pgd 4 msc 5 phd 6 jupeb
  // department: string;
  programme: string;

}

export interface StudentLedgerEntryMax2 {
  datePosted: Date;
  session: string;
  semester: string;
  qty: number;

  dr: number;
  cr: number;
  balance: number;
  details: string;

  paymentMode: string;
  bank: string;
  tellerDate: Date;
  tellerNo: string;
  receiptNo: string;
  depositor: string;
  staffIn: string;
  studentNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  level: number;
  product: string;
  activeStatus: boolean;
  studentType: number; // 1 undergrad, 2 direct entry, 3 pgd 4 msc 5 phd 6 jupeb
// department: string;
  programme: string;

  id: number;
}

export interface SearchPara {
  programme?: string; level?: number;
  faculty?: string; status?: boolean; studyStatus?: string;
  lName?: string; fName?: string ; gender?: string;
}

export interface PaystackAndPayments {
  reference: string;
  jambNo: string;
  detail: string;
  amount: number;
  tellerDate: Date;
  receiptNo: string;

  transactionType: string;
}

//       `export interface ReconcilationPayments {
//         reference: string;
//         jambNo: string;
//         detail: string;
//         amount: number;
//         tellerDate: Date;
//         receiptNo: string;
//         transactionType: string;
//       }`


