import {bindingMode, customElement, bindable, noView} from "aurelia-framework";

@noView()
@customElement('scriptinjector')
export class scriptinjector {

  @bindable url;
  @bindable isAsync;
  @bindable({defaultBindingMode: bindingMode.oneWay}) scripttag;

  attached() {
    if (this.url) {
      this.scripttag = document.createElement('script');
      if (this.isAsync) {
        this.scripttag.async = true;
      }
      this.scripttag.setAttribute('src', this.url);
      document.body.appendChild(this.scripttag);
    }
  }

  detached() {
    if (this.scripttag) {
      this.scripttag.remove();
    }
  }
}
