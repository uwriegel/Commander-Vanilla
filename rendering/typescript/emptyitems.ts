import { BaseItems } from './baseitems.js'
import { Item } from './Item'

export class EmptyItems extends BaseItems {
    constructor() { super("") }

    appendColumns(row: HTMLTableRowElement, item: Item) {}

    columns = [
        { name: "Name" }
    ];
}