class ConflictItems extends BaseItems {
    constructor() { super("conflicts") }

    getItems(): Promise<Item[]> {
        throw new Error("Method not implemented.");
    }    
    
    columns = [
        { name: "Name", onSort: (ascending: boolean) => this.onNameSort(ascending) },
        { name: "Größe", onSort: (ascending: boolean) => this.onSizeSort(ascending) },
        { name: "Datum", onSort: (ascending: boolean) => this.onDateSort(ascending) },
        { name: "Version", onSort: (ascending: boolean) => this.onVersionSort(ascending) },
    ];

    name = "ConflictItems"
    
    protected appendColumns(row: HTMLTableRowElement, item: any): void {
        let child = this.nameTemplate.cloneNode(true) as HTMLElement
        const img = child.getElementsByClassName("it-image")[0] as HTMLImageElement
        const ext = FileHelper.getExtension(item.name)
        img.src = `icon://${(ext == ".exe" ? this.basePath + "\\" + item.name : ext)}`
        let text = child.getElementsByClassName("it-nameValue")[0] as HTMLElement
        text.innerText = item.name
        row.appendChild(child)

/*        child = this.textTemplate.cloneNode(true) as HTMLElement
        const exifText = child.getElementsByClassName("it-text")[0] as HTMLElement
        if (item.exifDateTime == undefined) {
            const inBackground = async () => {
                item.exifDateTime = await FileHelper.getExifDate(this.basePath + "\\" + item.name)
                if (item.exifDateTime) {
                    exifText.innerText = FileHelper.formatDate(item.exifDateTime)
                    exifText.classList.add("exif")
                }
                else
                    item.exifDateTime = null
            }
            inBackground()
        }
        if (item.exifDateTime) {
            exifText.innerText = FileHelper.formatDate(item.exifDateTime)
            exifText.classList.add("exif")
        }
        else if (item.dateTime)
            exifText.innerText = FileHelper.formatDate(item.dateTime)
        row.appendChild(child)

        child = this.sizeTemplate.cloneNode(true) as HTMLElement
        text = child.getElementsByClassName("it-text")[0] as HTMLElement
        text.innerText = FileHelper.formatFileSize(item.fileSize)
        row.appendChild(child)

        child = this.textTemplate.cloneNode(true) as HTMLElement
        if (item.version == undefined) {
            const inBackground = async () => {
                item.version = await FileHelper.getFileVersion(this.basePath + "\\" + item.name)
                text = child.getElementsByClassName("it-text")[0] as HTMLElement
                text.innerText = item.version
            }
            inBackground()
        }
        else if (item.version != "") {
            text = child.getElementsByClassName("it-text")[0] as HTMLElement
            text.innerText = item.version
        }
        row.appendChild(child)
*/
    }
}