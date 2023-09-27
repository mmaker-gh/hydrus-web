import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JsonViewDialogComponent } from './json-view-dialog/json-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface HydrusError {
  error: string;
  exception_type: string;
  status_code: HttpStatusCode
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  displayError(error: Error, message = 'Error', customText?: string) {
    console.error(error);
    const snackbarRef = this.snackbar.open(customText ?? `${message}: ${error.message ?? error}`, 'Details', {
      duration: 5000
    });
    snackbarRef.onAction().subscribe(() => {
      JsonViewDialogComponent.open(this.dialog, {title: message, json: error})
    });
  }

  handleError(error: Error, message?: string) {
    return this.displayError(error, message);
  }

  handleHttpError(error: HttpErrorResponse, message?: string) {
    return this.displayError(error, message, `${error.error ?? error.message}`)
  }

  handleHydrusHttpError(error: HttpErrorResponse, message = 'Error') {
    if(typeof error.error === 'object' && 'error' in error.error) {
      const hydrusError: HydrusError = error.error;
      const errorString = hydrusError.error.split('\n')[0];
      return this.displayError(error, message, errorString);
    } else {
      return this.handleHttpError(error, message);
    }
  }

  handleHydrusError(error: HttpErrorResponse | Error, message = 'Error') {
    if(!(error instanceof HttpErrorResponse)) {
      return this.handleError(error);
    } else {
      return this.handleHydrusHttpError(error, message);
    }
  }
}
