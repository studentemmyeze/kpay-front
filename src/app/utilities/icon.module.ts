// // icon.module
// // Third Example - icon module 
// import { NgModule } from "@angular/core"; 
// import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"; 
// import { MaterialModule } from "../shared/material.module"; 
// import { MatIconRegistry } from "@angular/material/icon"; 
// @NgModule({ 
// imports: [MaterialModule]}) 
// export class IconModule { 
// private path: string = "../../assets/images";
//  constructor(
//   private domSanitizer: DomSanitizer, 
//   public matIconRegistry: MatIconRegistry ) {
//   this.matIconRegistry
//   .addSvgIcon("home", this.setPath(`${this.path}/home.svg`))
//   .addSvgIcon("add", this.setPath(`${this.path}/file-plus.svg`));
//  }
//  private setPath(url: string): SafeResourceUrl { 
//   return this.domSanitizer.bypassSecurityTrustResourceUrl(url); 
//  }
// }