import { HydrusFilesService } from './../hydrus-files.service';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, Optional, Self, ChangeDetectorRef } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { TagUtils } from '../tag-utils';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { HydrusTagsService } from '../hydrus-tags.service';
import { HydrusTagSearchTag } from '../hydrus-tags';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.scss']
})
export class TagInputComponent implements OnInit, ControlValueAccessor {

  searchTags: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  tagUtils = TagUtils;

  tagCtrl = new UntypedFormControl();
  filteredTags: Observable<HydrusTagSearchTag[]>;

  //inputControl = new FormControl("", this.validators)

  @Input() placeholder: string;

  @Input() defaultTags: string[];

  @Output()
  tags = new EventEmitter<string[]>();

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    @Optional() @Self() private controlDir: NgControl,
    public filesService: HydrusFilesService,
    public tagsService: HydrusTagsService,
    private cd: ChangeDetectorRef) {
    if (this.controlDir) {
      this.controlDir.valueAccessor = this
    }

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      //startWith(''),
      //map((tag: string) => this._filter(tag))
      debounceTime(500),
      switchMap(search => search && search.length > 3 ? this.tagsService.searchTags(search) : of([]))
      //map(tags => tags/*. slice(0, 25) */.map(t => t.value))
    );
   }


  writeValue(obj: string[]): void {
    obj && this.setSearchTags(obj);
  }

  registerOnChange(fn: any): void {
    //throw new Error('Method not implemented.');
    this.tags.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  onTouched() {}

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.tagCtrl.disable() : this.tagCtrl.enable()
  }

  ngOnInit() {
    if(this.defaultTags) {
      this.searchTags = [...this.defaultTags];
    }
  }

  chipInputEvent(event: MatChipInputEvent): void {
    if(this.matAutocomplete.isOpen && this.matAutocomplete.options.some(x => x.active)) {
      return;
    }

    const input = event.input;
    const value = event.value.toLowerCase(); // Hydrus tags are always lowercase

    this.addSearchTag(value);

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  addSearchTag(tag: string) {
    const value = tag.toLowerCase();
    if ((value || '').trim()) {
      this.searchTags.push(value);
    }

    this.tags.emit(this.searchTags);
  }

  setSearchTags(tags: string[]) {
    this.searchTags = [...tags];
    this.tags.emit(this.searchTags);
  }



  removeSearchTag(tag: string): void {
    const index = this.searchTags.indexOf(tag);

    if (index >= 0) {
      this.searchTags.splice(index, 1);
    }

    this.tags.emit(this.searchTags);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.addSearchTag(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }


  // private _filter(value: string): string[] {
  //   let filterValue = value ? value.toLowerCase() : '';
  //   const isNegated = filterValue.startsWith('-');
  //   if (isNegated) {
  //     filterValue = filterValue.substring(1);
  //   }

  //   let results = Array.from(this.filesService.getKnownTags())
  //     .filter(tag => tag.toLowerCase().indexOf(filterValue) !== -1)
  //     .filter(tag => !this.searchTags.includes(tag)).slice(0, 25);

  //   if (isNegated) {
  //     results = results.map(t => `-${t}`);
  //   }

  //   return results;
  // }


}
