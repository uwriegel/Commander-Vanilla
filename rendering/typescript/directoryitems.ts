
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

    async appendColumns(row: HTMLTableRowElement, item: DirectoryItem) {
        let child = this.nameTemplate.cloneNode(true) as HTMLElement
        const img = child.getElementsByClassName("it-image")[0] as HTMLImageElement
        const ext = FileHelper.getExtension(item.name)
        if (item.isDirectory) {
            img.classList.add("svg")
            img.classList.add("svg-icon")
            SvgInjector.replace(img, DirectoryItems.folderIcon)
        }
        else
            img.src = `icon://${(ext == ".exe" ? this.basePath + "\\" + item.name : ext)}`
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

        if (item.isHidden)
            row.classList.add("it-hidden")
    }

    columns = [
        { name: "Name", onSort: (ascending: boolean) => this.onNameSort(ascending) },
        { name: "Erw.", onSort: (ascending: boolean) => this.onExtSort(ascending) },
        { name: "Datum", onSort: (ascending: boolean) => this.onDateSort(ascending) },
        { name: "Größe", onSort: (ascending: boolean) => this.onSizeSort(ascending) },
        { name: "Version", onSort: (ascending: boolean) => this.onVersionSort(ascending) },
    ];

    name = "DirectoryItems"

    private onExtSort(ascending: boolean) {
        return this.onSort((a, b) => FileHelper.getExtension(a.name).localeCompare(FileHelper.getExtension(b.name)), ascending)
    }

    private static readonly folderIcon = SvgInjector.getIcon("assets/images/folder.svg")!
}