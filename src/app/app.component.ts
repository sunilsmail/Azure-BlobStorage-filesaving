import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { combineAll, map } from 'rxjs/operators';
import { ISasToken } from './azure-storage/azureStorage';
import { BlobStorageService } from './azure-storage/blob-storage.service';

interface IUploadProgress {
  filename: string;
  progress: number;
}

@Component({
  selector: 'app-root',
  template: `
  <div style="text-align:center">
    <h1>
      Welcome to Angular-blob-storage-upload
    </h1>
  </div>
  <input type="file" multiple="multiple" (change)="onFileChange($event)">

  <div *ngIf="filesSelected">
    <h2>Upload Progress</h2> 
    <pre>{{uploadProgress$ | async | json}}</pre>
  </div>
  `,
  styles: []
})
export class AppComponent {
  uploadProgress$: Observable<IUploadProgress[]>;
  filesSelected = false;

  constructor(private blobStorage: BlobStorageService) { }

  onFileChange(event: any): void {
    this.filesSelected = true;

    this.uploadProgress$ = from(event.target.files as FileList).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  uploadFile(file: File): Observable<IUploadProgress> {
    const accessToken: ISasToken = {
      container: 'sunilpmw',
      filename: file.name,
      storageAccessToken:
        '?st=2018-10-09T11%3A12%3A19Z&se=2018-12-10T11%3A12%3A00Z&sp=rwl&sv=2018-03-28&sr=c&sig=wQUelqv3eC%2BmIoevSORPSlv502f62oV6o4ihF%2FMjoBw%3D',
      storageUri: 'https://storageacctwhtxcvzurpjti.blob.core.windows.net/sunilpmw'
    };

    return this.blobStorage
      .uploadToBlobStorage(accessToken, file)
      .pipe(map(progress => this.mapProgress(file, progress)));
  }

  private mapProgress(file: File, progress: number): IUploadProgress {
    return {
      filename: file.name,
      progress: progress
    };
  }
}
