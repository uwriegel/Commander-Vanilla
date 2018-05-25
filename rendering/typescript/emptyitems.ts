class EmptyItems extends BaseItems {
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