
class DirectoryItems extends BaseItems {
    constructor(basePath: string) { super(basePath) }

    async getItems() {
        return new Promise<Item[]>((res, rej) => {
            addon.readDirectory(this.basePath, (err, result) => {
                var items = result.map(item => {
                    return {
                        name: item.name,
                        isDirectory: item.isDirectory,
                        isSelected: false,
                        isHidden: item.isHidden,
                        dateTime: item.time,
                        fileSize: item.size    
                     }
                }) as Item[]
                var directories = ([{
                    name: "..",
                    isDirectory: true,
                    isSelected: false,
                    isHidden: false
                }] as Item[]).concat(items.filter(item => item.isDirectory))
                var files = items.filter(item => !item.isDirectory)
                res(directories.concat(files))
            })
        })
    }

    appendColumns(row: HTMLTableRowElement, item: DirectoryItem) {
        // TODO: in items requestid, die erhöht wird. asynchron von jedem nicht gefüllten item hier anstoßen, die fehlenden Daten zu füllen, requestid überprüfen
        let child = this.nameTemplate.cloneNode(true) as HTMLElement
        const img = child.getElementsByClassName("it-image")[0] as HTMLImageElement
        const ext = FileHelper.getExtension(item.name)
        if (item.isDirectory) 
            img.src = "assets/images/folder.png"
        else
            img.src = `icon://${(ext == ".exe" ? this.basePath + item.name : ext)}`
        let text = child.getElementsByClassName("it-nameValue")[0] as HTMLElement
        text.innerText = item.isDirectory ? item.name : FileHelper.getNameOnly(item.name)
        row.appendChild(child)

        child = this.textTemplate.cloneNode(true) as HTMLElement
        if (!item.isDirectory) {
            text = child.getElementsByClassName("it-text")[0] as HTMLElement
            text.innerText = ext
        }
        row.appendChild(child)

        child = this.textTemplate.cloneNode(true) as HTMLElement
        text = child.getElementsByClassName("it-text")[0] as HTMLElement
        if (item.exifDateTime) {
            //text.innerText = FileHelper.formatDate(item.exifDateTime)
            text.classList.add("exif")
        }
        else if (item.dateTime)
             text.innerText = FileHelper.formatDate(item.dateTime)
        row.appendChild(child)

        child = this.sizeTemplate.cloneNode(true) as HTMLElement
        text = child.getElementsByClassName("it-text")[0] as HTMLElement
        text.innerText = FileHelper.formatFileSize(item.fileSize)
        row.appendChild(child)

        child = this.textTemplate.cloneNode(true) as HTMLElement
        if (item.version) {
            text = child.getElementsByClassName("it-text")[0] as HTMLElement
            text.innerText = item.version
        }

        if (item.isHidden)
            row.classList.add("it-hidden")

        row.appendChild(child)
    }

    columns = [
        { name: "Name", onSort: (ascending: boolean) => this.onNameSort(ascending) },
        { name: "Erw.", onSort: (ascending: boolean) => this.onExtSort(ascending) },
        { name: "Datum", onSort: (ascending: boolean) => this.onDateSort(ascending) },
        { name: "Größe", onSort: (ascending: boolean) => this.onSizeSort(ascending) },
        { name: "Version", onSort: (ascending: boolean) => this.onVersionSort(ascending) },
    ];

    name = "DirectoryItems"

    private onNameSort(ascending: boolean) {
        return this.onSort((a, b) => a.name.localeCompare(b.name), ascending)
    }

    private onExtSort(ascending: boolean) {
        return this.onSort((a, b) => FileHelper.getExtension(a.name).localeCompare(FileHelper.getExtension(b.name)), ascending)
    }

    private onDateSort(ascending: boolean) {
        return this.onSort((a, b) => {
            // var date1 = (<DirectoryItem>a).exifDateTime ? (<DirectoryItem>a).exifDateTime : (<DirectoryItem>a).dateTime
            // var date2 = (<DirectoryItem>b).exifDateTime ? (<DirectoryItem>b).exifDateTime : (<DirectoryItem>b).dateTime
            // return date1!.localeCompare(date2!)
            var result = 0
            if ((<DirectoryItem>a).dateTime < ((<DirectoryItem>b).dateTime!))
                result = -1
            else if ((<DirectoryItem>a).dateTime > ((<DirectoryItem>b).dateTime!))
                result = 1
            return result
        }, ascending)
    }

    private onSizeSort(ascending: boolean) {
        return this.onSort((a, b) => (<DirectoryItem>a).fileSize - (<DirectoryItem>b).fileSize, ascending)
    }

    private onVersionSort(ascending: boolean) {
        return this.onSort((a, b) => FileHelper.compareVersion((<DirectoryItem>a).version, (<DirectoryItem>b).version), ascending)
    }

    private textTemplate = (document.getElementById("it-text") as HTMLTemplateElement).content.querySelector("td")!
    private sizeTemplate = (document.getElementById("it-size") as HTMLTemplateElement).content.querySelector("td")!
}