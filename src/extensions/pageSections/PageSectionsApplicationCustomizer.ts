import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { initializeIcons } from '@fluentui/react';
import { Constants } from '../../constants/Constants';
import { IGlobalWindow } from '../../models';
import {
  IRenderButtonsService,
  ISectionService,
  RenderButtonsService,
  SectionService
} from '../../services';

export interface IPageSectionsApplicationCustomizerProperties {
  globalSectionsUrl: string;
}

export default class PageSectionsApplicationCustomizer
  extends BaseApplicationCustomizer<IPageSectionsApplicationCustomizerProperties> {
  private renderService: IRenderButtonsService;
  private sectionsService: ISectionService;
  private addSectionButtonInitiated: number;
  private copySectionButtonInitiated: number;
  private dataInitiated: boolean = false;

  public onInit(): Promise<void> {
    initializeIcons();

    if (!(window as IGlobalWindow)[Constants.IsSitePageSelector]) {
      return Promise.resolve();
    }

    this.renderService = this.context.serviceScope.consume(RenderButtonsService.serviceKey);
    this.sectionsService = this.context.serviceScope.consume(SectionService.serviceKey);

    this.addSectionButtonInitiated = setInterval(() => this.initializeAddSectionButton(), 1000);
    this.copySectionButtonInitiated = setInterval(() => this.initializeCopySectionButton(), 1000);

    return Promise.resolve();
  }

  private initializeAddSectionButton(): void {
    if (!this.isEditModeOfPage() || this.dataInitiated) {
      return;
    }
    setTimeout(() => this.addSectionButtonsToPage(), 1000);

    this.dataInitiated = true;
    clearInterval(this.addSectionButtonInitiated);
  }

  private async initializeCopySectionButton(): Promise<void> {
    if (!this.isEditModeOfPage()) {
      return;
    }

    clearInterval(this.copySectionButtonInitiated);
    const hasUserPermissions = await this.sectionsService.hasUserCreationPermissionToSectionTemplates(this.context.pageContext.web.absoluteUrl);
    if (!hasUserPermissions) {
      return;
    }

    setInterval(() => this.setCopySectionButton(), 1000);
  }

  private async addSectionButtonsToPage(): Promise<void> {
    const { web, listItem } = this.context.pageContext;
    const listItemId = listItem ? listItem.id : 0;
    this.renderService.renderAddSectionButton(web.absoluteUrl, this.properties.globalSectionsUrl, listItemId);
    clearInterval(this.addSectionButtonInitiated);
  }

  private async setCopySectionButton(): Promise<void> {
    if (!this.isToolbarRendered() || this.isCopyButtonRendered()) {
      return;
    }
    const { web, listItem } = this.context.pageContext;
    const listItemId = listItem ? listItem.id : 0;
    this.renderService.renderCopySectionButton(web.absoluteUrl, listItemId);
  }

  private isCopyButtonRendered(): boolean {
    return !!document.getElementById(Constants.CopyButtonId);
  }

  private isToolbarRendered(): boolean {
    return !!document.querySelector(Constants.ToolbarSelector);
  }

  private isEditModeOfPage(): boolean {
    return !!document.querySelector(Constants.CanvasZoneEditSelector);
  }
}