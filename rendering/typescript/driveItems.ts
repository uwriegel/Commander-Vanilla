enum DriveType {
	Unknown,
	NoRoot,
	Removable,
	Fixed,
	Remote,
	Rom,
	Ram
}

class DriveItems extends BaseItems {
    constructor() { super("")}

    async getItems() {
        return new Promise<Item[]>((res, rej) => {
            addon.getDrives((err, result) => {
                var items = result.map(item => {
                    return {
                        name: item.name,
                        label: item.label,
                        type: item.type,
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
        switch (item.type) {
            case DriveType.Fixed:
                img.src = "assets/images/drive.png"
                break;
            case DriveType.Rom:
                img.src = "assets/images/folder.png"
                break;
            case DriveType.Removable:
                img.src = "assets/images/parentfolder.png"
                break;
        }
        
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