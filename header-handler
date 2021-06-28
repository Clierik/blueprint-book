import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable() 
export class HeaderHandler implements HttpInterceptor {
  constructor() {}
  
  intercept( request: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'your headers here...'
      }
      setParams: {
        'your parameters here'
      }
    });
    return next.handle(request);
  }
}
