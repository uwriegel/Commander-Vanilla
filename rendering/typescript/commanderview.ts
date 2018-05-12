import { TableView } from './tableView.js'
import { DirectoryItems } from './DirectoryItems.js'
import { getShowHidden } from './globalsettings.js'
import { BaseItems } from './BaseItems.js'
import { EmptyItems } from './EmptyItems.js'
import { Item } from './item.js'
import * as addon from 'addon'
// TODO: Several icons initially too narrow
// TODO: Sorting by name

export class CommanderView {
    constructor(private parent: HTMLElement, id: string) {
        this.tableView = new TableView(this.parent, id)
        this.parent.onkeypress = e => this.keysRestrict(e)

        this.parent.onkeydown = e => {
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

        this.restrictor.classList.add('restrictor')
        this.restrictor.classList.add('restrictorHide')
        this.parent.appendChild(this.restrictor)
    } 

    async setPath(path: string) {
        this.items = new DirectoryItems(path)
        this.tableView.setColumns(this.items.columns, "testColumns")
        this.tableView.setItemsControl(this.items)
        await this.refresh()
    }

    async refresh() {
        const [recentItems, currentIndex] = this.tableView.getItemsToSort()
        const currentItem = recentItems[currentIndex]
        const result = await this.getDirectoryItems(this.items.basePath)
        const items = getShowHidden() ? result : result.filter(item => !item.isHidden)

        let newItemIndex = 0
        if (currentItem) {
            items.forEach((item, index) => {
                if (item.name == currentItem.name)
                    newItemIndex = index
            })
        }
        this.tableView.setSortedItems(items, newItemIndex)
    }

    focus() {
        this.tableView.focus()
    }

    setOnFocus(callback: () => void) {
        this.tableView.setOnFocus(callback)
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

    // /**
    // * Einschränken der Anzeige der Einträge auf die Beschränkten.
    // * @param prefix Der eingegebene Prefix zur Beschänkung
    // * @param back Im Prefix um einen Buchstaben zurückgehen
    // * @returns true: Es wird restriktiert
    // */
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

    private async getDirectoryItems(path: string)  {
        return new Promise<Item[]>((res, rej) => {
            addon.readDirectory(path, (err, result) => {
                res(result.map(item => {
                    return {
                        name: item.name,
                        isDirectory: item.isDirectory,
                        isSelected: false,
                        isHidden: item.isHidden,
                        dateTime: item.time,
                        fileSize: item.size    
                    }     
                }))
            })
        })
    }

    /**
    * Das input-Element, welches die Beschränkungszeichen darstellt</var>
    */
    private readonly restrictor = document.createElement('input')
    private items: BaseItems = new EmptyItems()
    private originalItems: Item[] | null = null
    private readonly tableView: TableView
}