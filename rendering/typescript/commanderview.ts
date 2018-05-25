
class CommanderView {
    constructor(parent: HTMLElement, private id: string) {
        this.commanderDirectory.classList.add('directory')
        parent.appendChild(this.commanderDirectory)        
        parent.appendChild(this.tableParent)
        this.tableParent.style.flexGrow = "1"
        this.tableView = new TableView(this.tableParent, id)
        this.tableView.onSelectedCallback = (openWith: boolean, showProperties: boolean) => {
            const [items, index] = this.tableView.getItemsToSort()
            if (items[index].isDirectory) {
                if (this.path.endsWith(":\\") && items[index].name == "..") 
                    this.changePath("root")
                else if (this.path == "root")
                    this.changePath(items[index].name)
                else
                    this.changePath(Path.join(this.path, items[index].name))
            }
        }
        this.tableView.onCurrentItemChanged = i => {
            const [items, index] = this.tableView.getItemsToSort()
            this.onCurrentItemChanged(items[index], this.path)
        }

        this.tableParent.onkeypress = e => this.keysRestrict(e)

        this.tableParent.onkeydown = e => {
            switch (e.which) {
                case 8: // BACKSPACE
                    this.restrictBack()
                    e.preventDefault()
                    break
                case 27: // ESC
                    if (this.restrictor.value)
                        this.closeRestrict()
                    // else
                    //     this.itemsSorter.selectAll(false)
                    break
                case 32: // _
                    if (this.restrictor.value == "") {
                        const [items, index] = this.tableView.getItemsToSort()
                        this.items.selectItem(items[index], index)
                    }
                    break
                case 35: // End
                    if (e.shiftKey) {
                        const [items, index] = this.tableView.getItemsToSort()
                        this.items.selectAll(items, index, false)
                        e.preventDefault()
                    }
                    break
                case 36: // Pos1
                    if (e.shiftKey) {
                        const [items, index] = this.tableView.getItemsToSort()
                        this.items.selectAll(items, index, true)
                        e.preventDefault()
                    }
                    break
                case 45: // Einfg
                    {
                        const [items, index] = this.tableView.getItemsToSort()
                        this.items.selectItem(items[index], index)
                        this.tableView.downOne()
                    }
                    break
                case 82: // r
                    if (e.ctrlKey) {
                        this.refresh()
                        e.preventDefault()
                    }
                    break
                case 107: // NUM +
                    {
                        const [items] = this.tableView.getItemsToSort()
                        this.items.selectAll(items, 0, false)
                    }
                    break
                case 109: // NUM -
                    {
                        const [items] = this.tableView.getItemsToSort()
                        this.items.selectAll(items, 0, true)
                    }
                    break
            }
        }

        this.commanderDirectory.onkeydown = e =>
        {
            switch (e.which)
            {
                case 13: // Enter
                    // if (e.altKey)
                    //     Connection.processItem(FileHelper.pathCombine(this.itemsModel.CurrentDirectory, this.commanderDirectory.value), true)
                    // else
                    //{

                        addon.getExifDate("A:\\Bilder\\2018\\Canon\\IMG_9791.JPG", (err, res) => {
                            console.log(res)
                            console.log(new Date())
                        })


                        this.changePath(this.commanderDirectory.value)
                        this.tableView.focus()
                    //}
                    break;
            }
        }

        this.commanderDirectory.onfocus = () => this.commanderDirectory.select()

        this.restrictor.classList.add('restrictor')
        this.restrictor.classList.add('restrictorHide')
        this.tableParent.appendChild(this.restrictor)
    } 

    onCurrentItemChanged: (item: Item, path: string) => void = (i, p)=>{}

    async changePath(path: string) {
        if (this.restrictor.value)
            this.closeRestrict()

        const recentPath = this.path
        this.path = path 
        this.commanderDirectory.value = this.path

        const items = ItemsChooser.get(this.items, path) 
        if (items) {
            this.items = items
            this.tableView.setColumns(this.items.columns, items.name + this.id)
            this.tableView.setItemsControl(this.items)
        }
        this.items.changePath(path)
        await this.refresh(recentPath.startsWith(this.path) ? Path.basename(recentPath) : 
            ((recentPath.endsWith(":\\") && path == "root") ? recentPath : ""))
    }

    async refresh(previousDirectory: string = "") {
        const [recentItems, currentIndex] = this.tableView.getItemsToSort()
        const currentItem = recentItems[currentIndex]
        const result = await this.items.getItems()
        const items = GlobalSettings.showHidden ? result : result.filter(item => !item.isHidden)

        let newItemIndex = 0
        if (currentItem) {
            items.forEach((item, index) => {
                if (item.name == currentItem.name)
                    newItemIndex = index
            })
        }
        let previous = -1
        if (previousDirectory) 
            previous = items.findIndex(n => n.name == previousDirectory)
        
        this.tableView.setSortedItems(items, previous != -1 ? previous : newItemIndex)
    }

    focus() {
        this.tableView.focus()
    }

    setOnFocus(callback: () => void) {
        this.tableView.setOnFocus(callback)
    }

    focusDirectoryInput() {
        this.commanderDirectory.focus()
    }

    isDirectoryInputFocused() {
        return this.commanderDirectory.contains(document.activeElement)
    }
    
    onResize() {
        this.tableView.resizeChecking()
    }

    private keysRestrict(e: KeyboardEvent) {
        let restrict = String.fromCharCode(e.charCode).toLowerCase()
        restrict = this.restrictor.value + restrict

        const [items] = this.tableView.getItemsToSort()
        if (this.restrict(items, restrict))
            this.checkRestrict(restrict)
        if (!this.tableView.focus())
            this.tableView.pos1()
    }

    /**
    * Einschränken der Anzeige der Einträge auf die Beschränkten.
    * @param prefix Der eingegebene Prefix zur Beschänkung
    * @param back Im Prefix um einen Buchstaben zurückgehen
    * @returns true: Es wird restriktiert
    */
    private restrict(items: Item[], prefix: string, back?: boolean): boolean {
        if (!this.originalItems)
            this.originalItems = items

        var restrictedItems: Item[] = []
        if (back)
            items = this.originalItems
        items.forEach((item) => {
            if (item.name.toLowerCase().indexOf(prefix) == 0)
                restrictedItems.push(item)
        })

        if (restrictedItems.length > 0) {
            items = restrictedItems
            this.tableView.setSortedItems(items, 0)
            return true
        }
        return false
    }

    private restrictBack() {
        let restrict = this.restrictor.value
        restrict = restrict.substring(0, restrict.length - 1)
        if (restrict.length == 0)
            this.closeRestrict()
        else {
            if (this.restrict(this.originalItems!, restrict))
                this.checkRestrict(restrict)
            this.tableView.focus()
        }
    }

    private closeRestrict(noRefresh?: boolean) {
        this.restrictor.classList.add('restrictorHide')
        this.restrictor.value = ""
        if (!noRefresh && this.originalItems) 
            this.tableView.setSortedItems(this.originalItems!, 0)
        this.originalItems = null
        this.tableView.focus()
    }

    private checkRestrict(restrict: string) {
        this.restrictor.classList.remove('restrictorHide')
        this.restrictor.value = restrict
    }

    /**
    * Das input-Element, welches die Beschränkungszeichen darstellt</var>
    */
    private readonly restrictor = document.createElement('input')
    private readonly commanderDirectory = document.createElement("input")
    private readonly tableParent = document.createElement('div')
    private readonly tableView: TableView
    private items: BaseItems = new EmptyItems()
    private originalItems: Item[] | null = null
    private path = ""
}