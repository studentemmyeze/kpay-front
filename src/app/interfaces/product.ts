export interface Product {
  description: string;
  price: number;
  prodCode: string;
  creationStamp: string;
  notDefault?: boolean;
}

// export interface Programme {
//   dName: string;
//   creationStamp: string;
//   notDefault?: boolean;
//   isDeleted: boolean;
// }

export interface Programme {

  pName: string;
  dName?: string;

}

export interface ProgrammeFaculty {
  pName: string;
  facultyDCode: string;


}

export interface Faculty {
  dCode: string;
  dName: string;

}

// export interface Faculty {
//   dCode: string;
//   dName: string;
//   creationStamp: string;
//   notDefault?: boolean;
//   isDeleted: boolean;
// }
