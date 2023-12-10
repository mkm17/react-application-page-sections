import {
    DefaultButton,
    Icon,
    Panel,
    PrimaryButton,
    TextField,
    CommandButton, PanelType
} from '@fluentui/react';
import { SPHttpClient } from '@microsoft/sp-http';
import { IconPicker } from '@pnp/spfx-controls-react/lib/controls/iconPicker';
import * as strings from 'PageSectionsApplicationCustomizerStrings';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Constants } from '../../constants/Constants';
import { useErrorHandler, useLoadingHandler } from '../../hooks';
import { ISectionService } from '../../services';
import { MessageDisplay } from '../messageDisplay/MessageDisplay';
import styles from './CopySectionsButton.module.scss';

export interface ICopySectionButtonProps {
    spHttpClient: SPHttpClient;
    sectionService: ISectionService;
    currentWebUrl: string;
    currentPageId: number;
}

const isElementsIsOnTheSameLevelAsSectionVertically = (clickedElement: HTMLElement, sectionElement: HTMLElement): boolean => {
    const rect1 = clickedElement.getBoundingClientRect();
    const rect2 = sectionElement.getBoundingClientRect();

    return rect1.top >= rect2.top && rect1.top <= rect2.bottom;
};

export const CopySectionButton: React.FC<ICopySectionButtonProps> = (props) => {
    const [showSettingPanel, setShowSettingPanel] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sectionJson, setSectionJson] = useState('');
    const [icon, setIcon] = useState('');
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);
    const { withError, errorText } = useErrorHandler();
    const { withLoading, isLoading } = useLoadingHandler();

    const clearFormFields = useCallback(() => {
        setTitle('');
        setDescription('');
        setSectionJson('');
        setIcon('');
        setCopiedToClipboard(false);
    }, []);

    useEffect(() => {
        setShowSettingPanel(false);
        clearFormFields();
    }, []);

    const handleCopyButtonClick = useCallback(async (event: React.MouseEvent<HTMLElement>): Promise<void> => {
        clearFormFields();
        const allCanvasZones = document.querySelectorAll(Constants.CanvasZoneEditSelector);
        let correctSelectedIndex = 0;
        for (let i = 0; i < allCanvasZones.length; i++) {
            if (
                isElementsIsOnTheSameLevelAsSectionVertically(event.target as HTMLElement, allCanvasZones[i] as HTMLElement)
            ) {
                correctSelectedIndex = i;
                break;
            }
        }

        const isVerticalSelected = (event.target as HTMLElement).getBoundingClientRect().left > 200;
        const pageContent = await props.sectionService.getSectionById(
            props.currentWebUrl,
            props.currentPageId,
            correctSelectedIndex,
            isVerticalSelected
        );

        setSectionJson(pageContent);
        setShowSettingPanel(!showSettingPanel);
    }, [
        props.sectionService,
        props.currentWebUrl,
        props.currentPageId,
        showSettingPanel,
    ]);

    const onCopySectionButtonClick = useCallback(async (event): Promise<void> => {
        await withError(withLoading(() => handleCopyButtonClick(event)), strings.CopySectionButtonClickError)()
    }, []);

    const onCloseSettingPanel = useCallback((): void => {
        setShowSettingPanel(false);
    }, []);

    const onCopyToClipboardClick = useCallback(async (): Promise<void> => {
        await navigator.clipboard.writeText(sectionJson);
        setCopiedToClipboard(true);
    }, [sectionJson]);

    const saveSection = useCallback(async (): Promise<void> => {
        await props.sectionService.createNewSiteSection(props.currentWebUrl, {
            Description: description,
            Title: title,
            JSONTemplate: sectionJson,
            IconName: icon,
        });
        onCloseSettingPanel();
    }, [title, description, sectionJson, icon]);

    const handleTitleChange = useCallback((event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
        setTitle(newValue || '');
    }, [title]);

    const handleDescriptionChange = useCallback((event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
        setDescription(newValue || '');
    }, [description]);

    const handleIconSave = useCallback((iconName: string): void => {
        setIcon(iconName);
    }, [icon]);

    const onClearIconClick = useCallback((): void => {
        setIcon('');
    }, []);

    const onAcceptButtonClick = useCallback(async (): Promise<void> => {
        await withError(withLoading(saveSection), strings.CannotSaveSectionError)();
    }, [title, description, sectionJson, icon]);

    return (
        <>
            <Icon
                className={styles.copyButton}
                id={Constants.CopyButtonId}
                onClick={onCopySectionButtonClick}
                iconName={Constants.CopyIconName}
                title={strings.CopySectionButtonTitle}
            />
            <Panel onDismiss={onCloseSettingPanel} isOpen={showSettingPanel} isLightDismiss type={PanelType.medium}>
                <div>
                    <MessageDisplay
                        errorText={errorText}
                        isLoading={isLoading}
                    />
                    <h1 className={styles.buttonHeader}>
                        <span>{strings.CopySectionPanelTitle}</span>
                        <>{copiedToClipboard ?
                            <CommandButton
                                className={styles.copiedToClipboardButton}
                                onClick={onCopyToClipboardClick}
                                iconProps={{ iconName: Constants.AcceptIconName }}
                                text={strings.CopySectionCopiedToClipboardButtonLabel}
                            /> :
                            <Icon
                                className={styles.copyJsonIcon}
                                iconName={Constants.InfoIconName}
                                title={sectionJson}
                                onClick={onCopyToClipboardClick}
                            ></Icon>
                        }</>
                    </h1>
                    <TextField
                        required
                        label={strings.CopySectionFormTitle}
                        value={title}
                        onChange={handleTitleChange}
                    ></TextField>
                    <TextField
                        label={strings.CopySectionFormDescription}
                        value={description}
                        onChange={handleDescriptionChange}
                    ></TextField>
                    <div className={styles.iconContainer}>
                        <IconPicker
                            panelClassName={styles.iconPickerPanel}
                            buttonLabel={strings.AddSectionAddIconTitle}
                            onSave={handleIconSave}
                        />
                        {icon && icon.length > 0 && (
                            <>
                                <div className={styles.previewIconContainer}>
                                    <span>Preview:</span>
                                    <Icon className={styles.iconPreview} iconName={icon} />
                                </div>
                                <Icon
                                    iconName={Constants.CancelIconName}
                                    title={strings.CopySectionFormClearIconTitle}
                                    className={styles.removeIcon}
                                    onClick={onClearIconClick}
                                />
                            </>
                        )}
                    </div>
                    <div className={styles.footerButtons}>
                        <PrimaryButton
                            text={strings.PanelAcceptButtonLabel}
                            onClick={onAcceptButtonClick}
                            disabled={!title}
                        />
                        <DefaultButton text={strings.PanelCancelButtonLabel} onClick={onCloseSettingPanel} />
                    </div>
                </div>
            </Panel>
        </>
    );
};