import { IRenderButtonsService, ISectionService } from "./interfaces";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AddSectionButton, IAddSectionButtonProps } from "../components/addSectionButton/AddSectionButton";
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { SPHttpClient } from '@microsoft/sp-http';
import { CopySectionButton, ICopySectionButtonProps } from "../components/copySectionButton/CopySectionButton";
import { SectionService } from "./SectionService";

export class RenderButtonsService implements IRenderButtonsService {
    public static readonly serviceKey: ServiceKey<IRenderButtonsService> = ServiceKey.create<IRenderButtonsService>('RenderButtonsService', RenderButtonsService);
    private ADDITIONAL_OPTIONS_CONTAINER_ID = "additionalOptionsContainer";
    private COPY_OPTIONS_CONTAINER_ID = "copyOptionsContainer";
    private spHttpClient: SPHttpClient;
    private sectionService: ISectionService;
    private isRenderingInitialized: boolean = false;

    constructor(protected serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
            this.sectionService = serviceScope.consume(SectionService.serviceKey);
        });
    }

    public renderAddSectionButton(currentWebUrl: string, globalWebUrl: string, currentPageId: number): void {
        if (this.isRenderingInitialized) { return; }

        this.isRenderingInitialized = true;

        const secondaryCommandsContainer = this.getAddButtonContainer();
        if (!secondaryCommandsContainer) { return; }

        const additionalButton: React.ReactElement<IAddSectionButtonProps> =
            React.createElement(AddSectionButton, {
                spHttpClient: this.spHttpClient,
                sectionService: this.sectionService,
                currentPageId,
                currentWebUrl,
                globalWebUrl
            });
        ReactDOM.render(additionalButton, secondaryCommandsContainer);
    }

    public unMountAddSectionButton(): void {
        const button = document.getElementById(this.ADDITIONAL_OPTIONS_CONTAINER_ID);
        if (!button) { return; }
        ReactDOM.unmountComponentAtNode(button);
    }

    public renderCopySectionButton(currentWebUrl: string, currentPageId: number): void {
        const secondaryCommandsContainer = this.getCopyButtonContainer();
        if (!secondaryCommandsContainer) { return; }

        const copyButton: React.ReactElement<ICopySectionButtonProps> =
            React.createElement(CopySectionButton, {
                spHttpClient: this.spHttpClient,
                sectionService: this.sectionService,
                currentPageId,
                currentWebUrl
            });
        ReactDOM.render(copyButton, secondaryCommandsContainer);
    }

    public unMountCopySectionButton(): void {
        const button = document.getElementById(this.COPY_OPTIONS_CONTAINER_ID);
        if (!button) { return; }
        ReactDOM.unmountComponentAtNode(button);
    }

    public getIsRenderingInitialized(): boolean {
        return this.isRenderingInitialized;
    }

    private getAddButtonContainer(): HTMLDivElement | null {
        const commandBarContainers = document.getElementsByClassName('ms-CommandBar-primaryCommand');
        const realContainer = commandBarContainers && commandBarContainers.length > 0 ? commandBarContainers[0] : null;
        if (!realContainer) { return null; }

        const newDivElement = document.createElement('div');
        newDivElement.className = `ms-OverflowSet-item`;
        newDivElement.id = this.ADDITIONAL_OPTIONS_CONTAINER_ID;
        realContainer.appendChild(newDivElement);

        return newDivElement;
    }

    private getCopyButtonContainer(): HTMLDivElement | null {
        const toolbarExists = document.querySelector('[data-canvas-control="toolbar"].CanvasZoneToolbar');
        const realContainer = toolbarExists?.children[0].children[0];
        if (!realContainer) { return null; }

        const newDivElement = document.createElement('div');
        newDivElement.id = this.COPY_OPTIONS_CONTAINER_ID;
        realContainer.appendChild(newDivElement);

        return newDivElement;
    }
}