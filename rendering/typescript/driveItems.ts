class DriveItems extends BaseItems {
    constructor() { super("")}

    async getItems() {
        return new Promise<Item[]>((res, rej) => {
            addon.getDrives((err, result) => {
                var items = result.map(item => {
                    return {
                        name: item.name,
                        label: item.label,
                        isDirectory: true,
                        isSelected: false,
                        isHidden: false,
                        fileSize: item.size    
                     }
                }) as Item[]
                res(items)
            })
        })
    }            
    
    columns = [
        { name: "Name" },
        { name: "Bezeichnung" },
        { name: "Größe" }
    ];
    name = "DriveItems"

    protected appendColumns(row: HTMLTableRowElement, item: RootItem): void {
        let child = this.nameTemplate.cloneNode(true) as HTMLElement
        const img = child.getElementsByClassName("it-image")[0] as HTMLImageElement
        img.src = "assets/images/drive.png"
        let text = child.getElementsByClassName("it-nameValue")[0] as HTMLElement
        text.innerText = item.name
        row.appendChild(child)

        child = this.textTemplate.cloneNode(true) as HTMLElement
        text = child.getElementsByClassName("it-text")[0] as HTMLElement
        text.innerText = item.label
        row.appendChild(child)

        child = this.sizeTemplate.cloneNode(true) as HTMLElement
        text = child.getElementsByClassName("it-text")[0] as HTMLElement
        text.innerText = FileHelper.formatFileSize(item.fileSize)
        row.appendChild(child)
    }
}