import { BaseItems } from './baseitems.js'
import { DirectoryItems } from './directoryitems.js'
import { Item } from './Item'

export class EmptyItems extends BaseItems {
    constructor() { super("") }

    changePath(path: string) : BaseItems | null {
        return new DirectoryItems(path)
    }

    appendColumns(row: HTMLTableRowElement, item: Item) {}

    columns = [
        { name: "Name" }
    ];
}