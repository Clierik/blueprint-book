// TODO code needs some cleaning up for simplicity, especialy the html
// TODO there is a a bug were input cache needs clearing after items were removed and added for uploading
// TODO need to add info for setting up basic backend
// written on Angular+

import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-body-comp',
  templateUrl: `
      <!-- helper buttons for development -->
    <button (click)="listFiles()">get file list</button>
    <button (click)="clearDb()">clear database</button>
    <!-- form for file selection/submit -->
    <form name="fileInput" enctype="multipart/form-data">
      <input type="file" name="singleFile" id="inputFiles" multiple (change)="postFiles($event)" />
      <input type="submit" value="Upload" />
    </form>

    <header>
      <div class="headerTitle">
        <!-- <object ...></object> probably is not the best solution, 
          took the one that gave most control over size manipulation, 
          fill color changed in the svg file itself -->
        <object type="image/svg+xml" data="./../../../assets/share-square-solid.svg" class="titleImg"></object>
        <h1>Import file</h1>
      </div>

      <p class="headerText">Drag and drop files to add to upload queue. Edit individual upload files or batch edit files
        by selecting multiple files.</p>
    </header>

    <body>

      <div class="uploadMore">
        <p>Upload more files</p>
        <object type="image/svg+xml" data="./../../../assets/file-download-solid.svg" class="importImg"></object>
      </div>

      <div class="searchInput">
        <object type="image/svg+xml" data="./../../../assets/search-solid.svg" class="searchImg"></object>
        <input placeholder="Search imported data" />
      </div>

      <div class="tableWrapper">
        <table>
          <tr>
            <th class="checkbox">
              <!-- potentialy could use an external lib for quick styling, example:
                https://lokesh-coder.github.io/pretty-checkbox/ -->
              <mat-checkbox></mat-checkbox>
              <!-- leaving checkboxes out since now they are nonessential to the given task -->
            </th>
            <th>IMPORTED DATA</th>
            <th>IMPORT RANGE</th>
            <th>STATUS</th>
          </tr>
      
          <tr *ngFor="let file of filesInDb; let i = index">
            <td class="checkbox">
              <mat-checkbox></mat-checkbox>
            </td>
      
            <td>
              <p class="fileName">{{file.originalname}}</p>
            </td>
      
            <td>
              <p class="importRange">B10:M4</p>
            </td>
      
            <td class="progressCol">
              <div *ngIf="file.progress < 100">
                <p>{{file.progress}}% </p>
                <!-- didn't look to deep into progress bars, so atm using the stock angular materials one -->
                <mat-progress-bar mode="determinate" [value]="file.progress"></mat-progress-bar>
              </div>
      
              <div *ngIf="file.progress === 100" class="progressStatus">
                <p>
                  Complete
                  <object type="image/svg+xml" data="./../../../assets/check-circle-solid.svg"
                    class="uploadComplete"></object>
                </p>
              </div>
            </td>
          </tr>
      
        </table>
      </div>

    </body>

    <footer>
      <div>
        <p>Import range from </p>
        <p style="font-weight: bold;">2 Files</p>
        <input value="B10:M4" />
      </div>

      <!-- TODO -->
      <div *ngIf="this.fileList.lenght > 0">
        <p style="font-weight: bold;">X</p>
        <p>Cancel Remaining Uploads</p>
        <p style="color: grey;">{{uploadFileRemainingCount}} of {{uploadFileTotalCount}}</p>
        <!-- for canceling all uploads -->
        <button (click)="cancelFileUpload()">Cancel all</button>
      </div>
    </footer>
  `,
  styleUrls: ['./body-comp.component.scss']
})

export class BodyCompComponent implements OnInit {

  filesInDb: FileListInterface[];
  fileList: any = []; // file event array, from form input
  abortAllUploads: boolean = false; // ಠ_ಠ most likely a terrible idea
  uploadFileTotalCount: number = 0;
  uploadFileRemainingCount: number = 0;

  constructor(public http: HttpService) {}

  ngOnInit() {
    this.listFiles();
  }

  postFiles(inputEvent) {
    let form = document.querySelector('form');
    let inputFiles = inputEvent.target.files;
    form.addEventListener('change', () => {
      this.fileList = [];
      for (let i = 0; i < inputFiles.length; i++) {
        this.fileList.push(inputFiles[i]);
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      let i = 0;
      this.fileList.forEach(file => {
        file.filename = i++;
        console.log(file.filename);
        this.submit(file, file.filename);
        // question if its posible to pass a addEventListener() as a variable 
        // for aborting individual files, logic being 
        let newObj: FileListInterface = {
          originalname: file.name,
          filename: file.filename,
          progress: 0
        }
        this.filesInDb.push(newObj);
      })
      this.uploadFileTotalCount, this.uploadFileRemainingCount = this.fileList.length;
    });

    // form.addEventListener('abort', event => {
    //   console.log('aborting all');

    // });
  }

  submit(file, fileIndex) {
    // if xhr is moved outside this.submit() scope, submit only uploads one file at a time,
    // with this I have no idea how to access xhr.abort() to abort all downloads
    let xhr: any = new XMLHttpRequest();
    let formData = new FormData();
    formData.append('singleFile', file);
    xhr.upload.addEventListener('progress', progressEvent => {
      this.updateProgress(progressEvent, fileIndex);
    });
    xhr.open('POST', `${environment.url}/singleFile`);
    xhr.send(formData);
    // the problem starts after uploads are complete and if the page is not refreshed, this.filesInDb
    // array starts acting strange by adding extra files, sometimes doubling 
  }

  updateProgress(progressEvent, fileIndex) {
    if (progressEvent.lengthComputable === true) {
      let percentComplete = progressEvent.loaded / progressEvent.total * 100;
      // console.log(Math.floor(percentComplete) + ` ${file.name}`);
      let i = this.filesInDb.findIndex(file => file.filename === fileIndex);
      this.filesInDb[i].progress = Math.floor(percentComplete);
      // need a "easy on the resourses" way to check "if all downloads are complete" 
      // to refresh the array without refreshing the page (call this.listFiles())
      // console.log(this.filesInDb.findIndex(file => file.progress === 100) === -1 && 
      // );
      if (Math.floor(percentComplete) === 100) {
        this.uploadFileRemainingCount--;
      }
    }
  }

  cancelFileUpload(inputEvent) { // attempt at removing files from the array thats holding them
    this.abortAllUploads = !this.abortAllUploads;
    let inputFiles = inputEvent.target.files;
    this.filesInDb.splice(this.filesInDb.length - inputFiles.length, inputFiles.length);
    this.listFiles();
  }

  listFiles() {
    this.uploadFileTotalCount, this.uploadFileRemainingCount = 0;
    this.filesInDb = [];
    this.http.getFileList().subscribe(resp => {
      this.filesInDb = resp;
      console.log(resp);
    }, err => {
      console.log(err);
    });
  }

  clearDb() {
    // this will still need a server restart to clear server cache
    // nodemon does not help 
    // (╯°□°)╯︵ uoɯǝpou
    this.http.clear().subscribe(resp => {
      this.filesInDb = [];
      console.log(resp);
    }, err => {
      console.log(err);
    });
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface FileListInterface {
  // fieldname: string, // "multiFile"
  originalname: string, // "Dictionary - Copy - Copy.txt"
  // encoding: string, // "7bit"
  // mimetype: string, // "text/plain"
  // destination: string, // "uploads/"
  filename?: string, // "4d3a6fad6070a85592f469580a62d6b5"
  // path: string, // "uploads\4d3a6fad6070a85592f469580a62d6b5"
  // size: number, // 623899
  // meta: {
      // revision: number, // 0
      // created: number, // 1578576198345
      // version: number, // 0
  // }
  progress?: number,
  newFile?: boolean
}


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  xhr = new XMLHttpRequest();

  constructor(
    private httpClient: HttpClient
  ) {}

  getFileList() {
    return this.httpClient.get < FileListInterface[] > ('http://localhost:3000' + '/files');
  }

  clear() {
    return this.httpClient.get('http://localhost:3000' + '/del');
  }

}
