import { Component, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { MatSidenavContent } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CUBE, GRAPH, ratingsIcons, HYDRUS } from './svg-icons';
import { HydrusVersionService } from './hydrus-version.service';
import { ThemeService } from './theme/theme.service';
import { ThemeTagsService } from './theme/theme-tags.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'hydrus-web';

  public refresh$: Subject<boolean> = new Subject();

  @ViewChild('toolbarActionsPortal', {read: CdkPortalOutlet}) public toolbarActionsPortal: CdkPortalOutlet;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      share()
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private updates: SwUpdate,
    private snackBar: MatSnackBar,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private hydrusVersionService: HydrusVersionService,
    private themeService: ThemeService,
    private tagThemeService: ThemeTagsService
  ) {
    iconRegistry.addSvgIconLiteral('cube', sanitizer.bypassSecurityTrustHtml(CUBE));
    iconRegistry.addSvgIconLiteral('graph', sanitizer.bypassSecurityTrustHtml(GRAPH));
    iconRegistry.addSvgIconLiteral('hydrus', sanitizer.bypassSecurityTrustHtml(HYDRUS));
    Object.entries(ratingsIcons).forEach(([name, literal]) => iconRegistry.addSvgIconLiteralInNamespace('rating', name, sanitizer.bypassSecurityTrustHtml(literal)))
  }

  @ViewChild(MatSidenavContent, {static: true})
  public sidenavContent: MatSidenavContent;

  public env = environment;

  ngOnInit() {
    this.updates.versionUpdates.subscribe(evt => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          this.snackBar.open('A new version of Hydrus Web is available', 'Refresh', {
            duration: 10000
          }).onAction().subscribe(() => {
            document.location.reload()
          });
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
    this.themeService.initTheming();
    this.tagThemeService.initTheming();
  }
}
