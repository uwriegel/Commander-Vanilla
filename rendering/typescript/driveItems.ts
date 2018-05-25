class DriveItems extends BaseItems {
    constructor() { super("")}

    async getItems() {
        return new Promise<Item[]>((res, rej) => {
            addon.getDrives((err, result) => {
                console.log(result)
            })
        })
    }            
    
    columns = [
        { name: "Name" },
        { name: "Bezeichnung" },
        { name: "Größe" }
    ];
    name = "DriveItems"

    protected appendColumns(row: HTMLTableRowElement, item: any): void {
        throw new Error("Method not implemented.");
    }
}