export interface IRenderButtonsService {
    renderAddSectionButton(currentWebUrl: string, globalWebUrl: string, currentPageId: number): void;
    renderCopySectionButton(currentWebUrl: string, currentPageId: number): void;
    unMountAddSectionButton(): void;
    unMountCopySectionButton(): void;
}