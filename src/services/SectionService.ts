import { Guid, ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { IColumnElement, ISection } from "../models";
import { ISectionService } from "./interfaces";
import { SPHttpClient } from '@microsoft/sp-http';
import { Constants } from "../constants/Constants";
import { sortBy, uniq } from "@microsoft/sp-lodash-subset";

export class SectionService implements ISectionService {
    public static readonly serviceKey: ServiceKey<ISectionService> = ServiceKey.create<ISectionService>('SectionService', SectionService);
    private spHttpClient: SPHttpClient;

    constructor(protected serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
        });
    }

    public async getSectionById(currentWeb: string, currentPageId: number, sectionId: number, isVerticalSection?: boolean): Promise<string> {
        try {
            const currentPageContent = await this.spHttpClient.get(`${currentWeb}/_api/sitepages/pages(${currentPageId})?$select=CanvasContent1,IsPageCheckedOutToCurrentUser`, SPHttpClient.configurations.v1);
            const pageContentJson = await currentPageContent.json();
            const canvasContent = JSON.parse(pageContentJson.CanvasContent1);

            if (isVerticalSection) {
                const sectionData = canvasContent.filter((item: IColumnElement) => item.position && item.position.layoutIndex === 2);
                return JSON.stringify(sectionData);
            } else {
                const sectionsIndexes = canvasContent.map((item: IColumnElement) => item.position && item.position.layoutIndex === 1 ? item.position.zoneIndex : undefined);
                const sectionsIndexesUnique = sortBy(uniq(sectionsIndexes));

                const sectionData = canvasContent.filter((item: IColumnElement) => item.position && item.position.zoneIndex === sectionsIndexesUnique[sectionId]);
                return JSON.stringify(sectionData);
            }
        } catch (error) {
            console.error('Error fetching section:', error);
            throw error;
        }
    }

    public async getGlobalSections(globalSiteUrl: string): Promise<ISection[]> {
        try {
            const sectionsItems = await this.spHttpClient.get(`${globalSiteUrl}/_api/web/lists/getByTitle('${Constants.SectionsListName}')/items`, SPHttpClient.configurations.v1);
            const sectionsItemsJson = await sectionsItems.json();

            return sectionsItemsJson.value;
        } catch (error) {
            console.warn('Error fetching global sections:', error);
            return [];
        }
    }

    public async getSiteSections(currentWeb: string): Promise<ISection[]> {
        try {
            const sectionsItems = await this.spHttpClient.get(`${currentWeb}/_api/web/lists/getByTitle('${Constants.SectionsListName}')/items`, SPHttpClient.configurations.v1);
            const sectionsItemsJson = await sectionsItems.json();

            return sectionsItemsJson.value;
        } catch (error) {
            console.error('Error fetching site sections:', error);
            throw error;
        }
    }

    public async createNewSiteSection(currentWeb: string, section: ISection): Promise<ISection> {
        try {
            const sectionsItems = await this.spHttpClient.post(
                `${currentWeb}/_api/web/lists/getByTitle('${Constants.SectionsListName}')/items`,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json;odata=nometadata',
                        'If-Match': '*'
                    },
                    body: JSON.stringify(section)
                }
            );
            const sectionsItemsJson = await sectionsItems.json();
            return sectionsItemsJson;
        } catch (error) {
            console.error('Error creating new site section:', error);
            throw error;
        }
    }

    public async addSectionToPage(currentWeb: string, currentPageId: number, JSONTemplate: string): Promise<void> {
        try {
            const currentPageContent = await this.spHttpClient.get(`${currentWeb}/_api/sitepages/pages(${currentPageId})?$select=*,CanvasContent1,IsPageCheckedOutToCurrentUser`, SPHttpClient.configurations.v1);
            const pageContentJson = await currentPageContent.json();
            let canvasContent = JSON.parse(pageContentJson.CanvasContent1);

            let lastSectionIndex = 1;
            for (const section of canvasContent) {
                if (section.position && section.position.zoneIndex > lastSectionIndex) {
                    lastSectionIndex = section.position.zoneIndex;
                }
            }
            const newSectionIndex = lastSectionIndex + 1;
            const newZoneId = Guid.newGuid().toString();

            const newSection = JSON.parse(JSONTemplate);
            for (const column of newSection) {
                if (column.webPartData && column.webPartData.instanceId) {
                    const newGuid = Guid.newGuid().toString();
                    column.webPartData.instanceId = newGuid;
                    column.id = newGuid;
                }

                column.position.zoneIndex = newSectionIndex;
                column.position.zoneId = newZoneId;
            }

            canvasContent = canvasContent.concat(newSection);

            if (true) {


                /*if (!pageContentJson.IsPageCheckedOutToCurrentUser) {

                    await this.spHttpClient.post(
                        `${currentWeb}/_api/web/GetFileByServerRelativePath(DecodedUrl=@a1)/CheckOut?@a1=%27%2Fsites%2FMediaPark%2FSitePages%2Ftest%281%29%2Easpx%27`,
                        SPHttpClient.configurations.v1,
                        {
    
    
                        }
                    );

                }*/


                /*await this.spHttpClient.post(
                    `https://mknetpl.sharepoint.com/_api/v2.1/drives/b!Z-jDRnmYHkOW-wMtAMqXjf801B2I88lLjnyxyQ7wiQc6VZAxUHixRo-E_ABgbWlu/items/4566ae2c-c701-4aab-9565-decf2e01853a/opStream/joinSession?ump=1`,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            'If-Match': '*'
                        },
                        body: JSON.stringify({
                            "authoringMetadata":
                            {
                                "SessionId": pageContentJson.AuthoringMetadata.SessionId,
                                "SequenceId": pageContentJson.AuthoringMetadata.SequenceId,
                                "FluidContainerCustomId": pageContentJson.AuthoringMetadata.FluidContainerCustomId,
                                "IsSingleUserSession": true,
                                "ClientOperation": 2
                            },
                            "connectivityUpdateReason": 1
                        })

                    }
                );*/


                /*await this.spHttpClient.post(
                    `${currentWeb}/_api/sitepages/pages(${currentPageId})/ExtendSessionCoAuth`,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            'If-Match': '*'
                        },
                        body: JSON.stringify({
                            "authoringMetadata":
                            {
                                "SessionId": pageContentJson.AuthoringMetadata.SessionId,
                                "SequenceId": pageContentJson.AuthoringMetadata.SequenceId,
                                "FluidContainerCustomId": pageContentJson.AuthoringMetadata.FluidContainerCustomId,
                                "IsSingleUserSession": true,
                                "ClientOperation": 2
                            },
                            "connectivityUpdateReason": 1
                        })

                    }
                );*/

                const pageSeqData = await this.spHttpClient.get(
                    `https://mknetpl.sharepoint.com/_api/v2.1/drives/b!Z-jDRnmYHkOW-wMtAMqXjf801B2I88lLjnyxyQ7wiQc6VZAxUHixRo-E_ABgbWlu/items/4566ae2c-c701-4aab-9565-decf2e01853a/opStream?ump=1&filter=sequenceNumber%20ge%20${pageContentJson.AuthoringMetadata.SequenceId}%20and%20sequenceNumber%20le%205106`,
                    SPHttpClient.configurations.v1
                );
                const pageSeqDataJson = await pageSeqData.json();


                const getLatestSequenceId = pageSeqDataJson.value[pageSeqDataJson.value.length - 1].sequenceNumber;

                const pageCoSaveResult = await this.spHttpClient.post(
                    `${currentWeb}/_api/sitepages/pages(${currentPageId})/SavePageCoAuth`,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            'If-Match': '*'
                        },
                        body: JSON.stringify({
                            //AuthorByline:[],
                            //BannerImageUrl: pageContentJson.BannerImageUrl,
                            CanvasContent1: JSON.stringify(canvasContent),
                            //LayoutWebpartsContent: pageContentJson.LayoutWebpartsContent,
                            //Title: pageContentJson.Title,
                            //TopicHeader: pageContentJson.TopicHeader,
                            // WebTranspileContent: pageContentJson.WebTranspileContent,
                            AuthoringMetadata: {
                                ClientOperation: 3,
                                //ClientOperation: 2,
                                FluidContainerCustomId: pageContentJson.AuthoringMetadata.FluidContainerCustomId,
                                IsSingleUserSession: true,
                                SequenceId: getLatestSequenceId,
                                SessionId: pageContentJson.AuthoringMetadata.SessionId
                            },
                            CoAuthState: {
                                Action: 1,
                                //LockAction: 1,
                                LockAction: 2,
                                SharedLockId: pageContentJson.CoAuthState?.SharedLockId
                            },
                            Collaborators: [
                                //{ LoginName: "mkornet@mknetpl.onmicrosoft.com" }
                            ]
                        })
                    }
                );


                const pageCoSaveResultJson = await pageCoSaveResult.json();
                console.log('Page co-save result:', pageCoSaveResultJson);

                

                /*await this.spHttpClient.post(
                    `${currentWeb}/_api/sitepages/pages(${currentPageId})/ExtendSessionCoAuth`,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            'If-Match': '*'
                        },
                        body: JSON.stringify({
                            "authoringMetadata":
                            {
                                "SessionId": pageContentJson.AuthoringMetadata.SessionId,
                                "SequenceId": pageContentJson.AuthoringMetadata.SequenceId,
                                "FluidContainerCustomId": pageContentJson.AuthoringMetadata.FluidContainerCustomId,
                                "IsSingleUserSession": true,
                                "ClientOperation": 2
                            },
                            "connectivityUpdateReason": 1
                        })

                    }
                );*/
            }
            else {
                await this.spHttpClient.post(
                    `${currentWeb}/_api/sitepages/pages(${currentPageId})/savepage`,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            'accept': 'application/json;odata=nometadata',
                            'content-type': 'application/json;odata=nometadata',
                            'If-Match': '*'
                        },
                        body: JSON.stringify({
                            CanvasContent1: JSON.stringify(canvasContent)
                        })
                    }
                );
            }
        } catch (error) {
            console.error('Error adding section to page:', error);
            throw error;
        }
    }

    public async hasUserCreationPermissionToSectionTemplates(currentWeb: string): Promise<boolean> {
        try {
            const currentUserPermissionToSectionTemplates = await this.spHttpClient.get(`${currentWeb}/_api/web/lists/getByTitle('${Constants.SectionsListName}')/EffectiveBasePermissions`, SPHttpClient.configurations.v1);
            const currentUserPermissionToSectionTemplatesJson: { High: string, Low: string } = await currentUserPermissionToSectionTemplates.json();

            const userPermissions: number = Number(currentUserPermissionToSectionTemplatesJson.Low).valueOf();
            const addItemPermissions = 0x0000000000000002;
            const hasEditPermissions: boolean = (userPermissions & addItemPermissions) === addItemPermissions;
            return hasEditPermissions;
        } catch (error) {
            console.error('Error checking user permissions:', error);
            throw error;
        }
    }
}
