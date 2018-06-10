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
    
    protected appendColumns(row: HTMLTableRowElement, item: ConflictItem): void {
        let child = this.nameTemplate.cloneNode(true) as HTMLElement
        const img = child.getElementsByClassName("it-image")[0] as HTMLImageElement
        const ext = FileHelper.getExtension(item.name)
        img.src = `icon://${(ext == ".exe" ? this.basePath + "\\" + item.name : ext)}`
        let text = child.getElementsByClassName("it-nameValue")[0] as HTMLElement
        text.innerText = item.name
        row.appendChild(child)

        child = this.conflictSizeTemplate.cloneNode(true) as HTMLElement
        let sourceText = child.getElementsByClassName("it-sourcesize")[0] as HTMLElement
        sourceText.innerText = FileHelper.formatFileSize(item.sourceFileSize)
        let targetText = child.getElementsByClassName("it-targetsize")[0] as HTMLElement
        targetText.innerText = FileHelper.formatFileSize(item.targetFileSize)
        row.appendChild(child)
        if (item.sourceFileSize == item.targetFileSize) {
            sourceText.classList.add("conflictsEqual")
            targetText.classList.add("conflictsEqual")
        }        

        child = this.timeTemplate.cloneNode(true) as HTMLElement
        sourceText = child.getElementsByClassName("it-sourceTime")[0] as HTMLElement
        sourceText.innerText = FileHelper.formatDate(item.sourceDateTime)
        targetText = child.getElementsByClassName("it-targetTime")[0] as HTMLElement
        targetText.innerText = FileHelper.formatDate(item.targetDateTime)
        row.appendChild(child)
        if (item.sourceDateTime > item.targetDateTime)
            sourceText.classList.add("conflictsNewer")
        else if (item.sourceDateTime < item.targetDateTime) {        
            targetText.classList.add("conflictsOlder")
//            this.shouldNotBeOverridden = true;
        }
        else {
            sourceText.classList.add("conflictsEqual")
            targetText.classList.add("conflictsEqual")
        }        

        child = this.versionTemplate.cloneNode(true) as HTMLElement
        sourceText = child.getElementsByClassName("it-sourceVersion")[0] as HTMLElement
        sourceText.innerText = item.sourceVersion ? item.sourceVersion : ""
        targetText = child.getElementsByClassName("it-targetVersion")[0] as HTMLElement
        targetText.innerText = item.targetVersion ? item.targetVersion : ""
        row.appendChild(child)
        let compareResult = FileHelper.compareVersion(item.sourceVersion, item.targetVersion)
        if (compareResult > 0)
            sourceText.classList.add("conflictsNewer")
        else if (compareResult < 0) {
            targetText.classList.add("conflictsOlder")
        //    this.shouldNotBeOverridden = true
        }
        else {
            sourceText.classList.add("conflictsEqual")
            targetText.classList.add("conflictsEqual")
        }        
    }

    protected getMeasureItem() {
        const child = this.conflictSizeTemplate.cloneNode(true) as HTMLElement
        let text = child.getElementsByClassName("it-sourcesize")[0] as HTMLElement
        text.innerText = FileHelper.formatFileSize(123)
        text = child.getElementsByClassName("it-targetsize")[0] as HTMLElement
        text.innerText = FileHelper.formatFileSize(123)
        return child
    }

    private conflictSizeTemplate = (document.getElementById("it-compare-size") as HTMLTemplateElement).content.querySelector("td")!
    private timeTemplate = (document.getElementById("it-compare-time") as HTMLTemplateElement).content.querySelector("td")!
    private versionTemplate = (document.getElementById("it-compare-version") as HTMLTemplateElement).content.querySelector("td")!
}