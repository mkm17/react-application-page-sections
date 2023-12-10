import { IColumnPosition } from './IColumnPosition';

export interface IColumnElement {
    position: IColumnPosition;
    controlType: number;
    id: string;
    webPartId: string;
    addedFromPersistedData: boolean;
    reservedHeight: number;
    reservedWidth: number;
}