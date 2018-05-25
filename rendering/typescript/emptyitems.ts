import { BaseItems } from './baseitems.js'
import { Item } from './Item'

export class EmptyItems extends BaseItems {
    constructor() { super("") }

    async getItems() {
        return new Promise<Item[]>((res, rej) => {res()})
    }

    appendColumns(row: HTMLTableRowElement, item: Item) {}

    columns = [
        { name: "Name" }
    ];
    name = "EmptyItems"
}