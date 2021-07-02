import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

@Injectable() 
export class ErrorHandler implements HttpInterceptor {

    constructor() {}

    intercept( request: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError( error => {
          return observableThrowError(error);
        }
      ))
    }
}
