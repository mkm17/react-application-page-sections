import {
    DefaultButton,
    Panel,
    PrimaryButton
} from '@fluentui/react';
import { SPHttpClient } from '@microsoft/sp-http';
import * as strings from 'PageSectionsApplicationCustomizerStrings';
import {
    ChoiceGroup,
    CommandButton,
    IChoiceGroupOption,
    PanelType,
    find,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Constants } from '../../constants/Constants';
import { useErrorHandler, useLoadingHandler } from '../../hooks';
import { ISection } from '../../models';
import { ISectionService } from '../../services';
import { MessageDisplay } from '../messageDisplay/MessageDisplay';
import styles from './AddSectionButton.module.scss';
import { SectionType } from '../../enums';

export interface IAddSectionButtonProps {
    spHttpClient: SPHttpClient;
    sectionService: ISectionService;
    currentWebUrl: string;
    globalWebUrl: string;
    currentPageId: number;
}

export const AddSectionButton: React.FC<IAddSectionButtonProps> = (props) => {
    const [showSettingPanel, setShowSettingPanel] = useState(false);
    const [sectionOptions, setSectionOptions] = useState<IChoiceGroupOption[]>([]);
    const [globalSectionOptions, setGlobalSectionOptions] = useState<IChoiceGroupOption[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [globalSections, setGlobalSections] = useState<ISection[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
    const { withError, errorText } = useErrorHandler();
    const { withLoading, isLoading } = useLoadingHandler();

    const setSectionSource = useCallback((sections: ISection[], sectionType: SectionType): void => {
        if (!sections || sections.length === 0) return;

        const sectionsOptions = sections.map(
            ({ Id, Title, IconName = Constants.SectionDefaultIconName }: ISection) => ({
                key: `${Id}-${sectionType}`,
                text: Title,
                iconProps: { iconName: (IconName && IconName.length > 0) ? IconName : Constants.SectionDefaultIconName },
            } as IChoiceGroupOption)
        );
        if (sectionType === SectionType.Global) {
            setGlobalSectionOptions((prevOptions) => [
                ...prevOptions,
                ...sectionsOptions,
            ]);
            setGlobalSections(sections);
            return;
        }
        setSectionOptions((prevOptions) => [
            ...prevOptions,
            ...sectionsOptions,
        ]);
        setSections(sections);
    }, []);

    const initData = useCallback(async (): Promise<void> => {
        try {
            const siteSections = await props.sectionService.getSiteSections(props.currentWebUrl);
            const globalSections =
                props.globalWebUrl && props.globalWebUrl !== props.currentWebUrl
                    ? await props.sectionService.getGlobalSections(props.globalWebUrl)
                    : [];

            setSectionSource(globalSections, SectionType.Global);
            setSectionSource(siteSections, SectionType.Site);

        } catch (error) {
            console.error(strings.SectionsLoadingFunctionError, error.message || error);
            throw error;
        }
    }, []);

    useEffect(() => {
        /* eslint-disable-next-line */
        void withError(withLoading(initData), strings.SectionsLoadingError)();
    }, []);

    useEffect(() => {
        setShowSettingPanel(false);
    }, []);

    const toggleSettingPanel = useCallback((): void => {
        setSelectedKey(undefined);
        setShowSettingPanel((prevShowSettingPanel) => !prevShowSettingPanel);
    }, []);

    const closeSettingPanel = useCallback((): void => {
        setShowSettingPanel(false);
    }, []);

    const triggerAddSection = useCallback(async (): Promise<void> => {
        try {
            const keyParts = selectedKey?.split('-');

            if (!keyParts || keyParts.length !== 2) {
                console.warn(strings.InvalidSectionWarning);
                return;
            }

            const sectionsList = keyParts[1] === SectionType.Global.toString() ? globalSections : sections;
            const section = find(
                sectionsList,
                (section: ISection) => section.Id?.toString() === keyParts[0]
            );

            if (!section) {
                console.warn(strings.SectionSelectionWarning);
                return;
            }

            await props.sectionService.addSectionToPage(
                props.currentWebUrl,
                props.currentPageId,
                section.JSONTemplate
            );

            location.reload();
        } catch (error) {
            console.error(strings.AddSectionFunctionError, error.message || error);
            throw error
        }
    }, [globalSections, sections, selectedKey]);

    const onChangeSectionChange = useCallback((ev: React.SyntheticEvent<HTMLElement>, option: IChoiceGroupOption) => {
        setSelectedKey(option.key);
    }, []);

    const onAcceptButtonClick = useCallback(async (): Promise<void> => {
        await withError(withLoading(triggerAddSection), strings.AddSectionError)();
    }, [globalSections, sections, selectedKey]);

    return (
        <>
            <CommandButton
                className={styles.commandButton}
                onClick={toggleSettingPanel}
                iconProps={{ iconName: Constants.AddIconName }}
                text={strings.AddSectionButtonLabel}
            />
            <Panel
                onDismiss={closeSettingPanel}
                isOpen={showSettingPanel}
                isLightDismiss
                type={PanelType.medium}
            >
                <div>
                    <MessageDisplay
                        errorText={errorText}
                        isLoading={isLoading}
                    />
                    <h1>{strings.AddSectionFormTitle}</h1>
                    {globalSectionOptions.length > 0 && (
                        <ChoiceGroup
                            label={strings.AddSectionGlobalChoiceGroupLabel}
                            options={globalSectionOptions}
                            onChange={onChangeSectionChange}
                            selectedKey={selectedKey}
                        />
                    )}
                    {sectionOptions.length > 0 && (
                        <ChoiceGroup
                            label={strings.AddSectionSiteChoiceGroupLabel}
                            options={sectionOptions}
                            onChange={onChangeSectionChange}
                            selectedKey={selectedKey}
                        />
                    )}
                    {
                        <div className={styles.footerButtons}>
                            <PrimaryButton
                                text={strings.PanelAcceptButtonLabel}
                                onClick={onAcceptButtonClick}
                                disabled={!selectedKey}
                            />
                            <DefaultButton text={strings.PanelCancelButtonLabel} onClick={closeSettingPanel} />
                        </div>
                    }
                </div>
            </Panel>
        </>
    );
};
