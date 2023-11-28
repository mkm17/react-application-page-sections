import { ISection } from "../../models";

export interface ISectionService {
    getSectionById(currentWeb: string, currentPageId: number, sectionId: number, isVerticalSection?: boolean): Promise<string>;
    getGlobalSections(globalSiteUrl: string): Promise<ISection[]>;
    getSiteSections(currentWeb: string): Promise<ISection[]>;
    createNewSiteSection(currentWeb: string, section: ISection): Promise<ISection>;
    addSectionToPage(currentWeb: string, currentPageId: number, JSONTemplate: string): Promise<void>;
    hasUserCreationPermissionToSectionTemplates(currentWeb: string): Promise<boolean>;
}