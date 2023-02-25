import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';


const DISABLED = 'required';
const APP_DISABLED = 'app-required';
const TAB_INDEX = 'tabindex';
const TAG_ANCHOR = 'a';

@Directive({
  selector: '[appRequired]'
})
export class AppRequiredDirective {
  @Input() appRequired = true;

  constructor(private eleRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges() {
    this.requiredElement(this.eleRef.nativeElement);
  }

  ngAfterViewInit() {
    this.requiredElement(this.eleRef.nativeElement);
  }

  private requiredElement(element: any) {
    if (this.appRequired) {
      if (!element.hasAttribute(DISABLED)) {
        this.renderer.setAttribute(element, APP_DISABLED, '');
        this.renderer.setAttribute(element, DISABLED, 'true');

        // disabling anchor tab keyboard event
        if (element.tagName.toLowerCase() === TAG_ANCHOR) {
          this.renderer.setAttribute(element, TAB_INDEX, '-1');
        }
      }
    } else {
      if (element.hasAttribute(APP_DISABLED)) {
        if (element.getAttribute('required') !== '') {
          element.removeAttribute(DISABLED);
        }
        element.removeAttribute(APP_DISABLED);
        if (element.tagName.toLowerCase() === TAG_ANCHOR) {
          element.removeAttribute(TAB_INDEX);
        }
      }
    }
    if (element.children) {
      for (let ele of element.children) {
        this.requiredElement(ele);
      }
    }
  }

}
