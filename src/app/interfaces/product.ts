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
  dName: string;

}

export interface ProgrammeFaculty {
  dName: string;
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
