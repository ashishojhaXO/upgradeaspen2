import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SearchPipe } from './search.pipe';

@NgModule({
  imports: [CommonModule,
    TranslateModule],
  declarations: [SearchPipe],
  exports: [SearchPipe],
  providers: []
})
export class SearchPipeModule {
}
