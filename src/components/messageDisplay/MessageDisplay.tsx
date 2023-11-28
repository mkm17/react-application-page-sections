import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import * as React from 'react';
import styles from './MessageDisplay.module.scss';

export interface IMessageDisplayProps {
    isLoading: boolean;
    errorText: string;
}

export const MessageDisplay: React.FC<IMessageDisplayProps> = (props) => {
    return <div>
        {props.isLoading && <div className={styles.loadingContainer}>
            <Spinner className={styles.loadingSpinner} size={SpinnerSize.large} />
        </div>}
        {props.errorText && <MessageBar messageBarType={MessageBarType.error}>{props.errorText}</MessageBar>}
    </div>;
}