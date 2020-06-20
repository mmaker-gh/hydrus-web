import { Component, OnInit, Inject } from '@angular/core';
import { HydrusFile } from '../hydrus-file';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import { TagUtils } from '../tag-utils';


type ShareData = {
  title?: string;
  text?: string;
  url?: string;
};

declare global {
  interface Navigator {
      share(data?: ShareData): Promise<void>;
  }
}

@Component({
  selector: 'app-file-info-sheet',
  templateUrl: './file-info-sheet.component.html',
  styleUrls: ['./file-info-sheet.component.scss']
})
export class FileInfoSheetComponent {

  tagUtils = TagUtils;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {file: HydrusFile}) { }

  navigatorShare = navigator.share;

  shareUrl(url: string) {
    if (navigator.share) {
      navigator.share({
        url
      });
    }
  }

}
