import { IColumn } from './columns.js'

export interface Items {
    createItem(item: any): HTMLTableRowElement
    columns: IColumn[]
}
