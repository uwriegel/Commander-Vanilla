import { Item } from './item.js'
import { Items } from './items.js'
import { IColumn } from './columns.js'
import { ISortable } from './ISortable'

export abstract class BaseItems implements Items {
    constructor(public basePath: string) { }

    abstract changePath(path: string) : BaseItems | null 

    createItem(item?: Item) {
        const row = document.createElement("tr")
        row.tabIndex = 1

        this.updateRow(row, item)
        return row
    }

    updateRow(row: HTMLTableRowElement, item?: Item) {
        if (item) {
            if (item.name == "..") {
                let child = this.parentTemplate.cloneNode(true) as HTMLElement
                row.appendChild(child)
            }
            else {
                row.innerHTML = ""
                this.appendColumns(row, item)
            }
                
            if (item.isSelected)
                row.classList.add("it-selected")
            else
                row.classList.remove("it-selected")
        }
        else {
            const child = this.nameTemplate.cloneNode(true) as HTMLElement
            const img = child.getElementsByClassName("it-image")[0] as HTMLElement
            img.classList.add("it-measureimage")
            const text = child.getElementsByClassName("it-nameValue")[0] as HTMLElement
            text.innerText = " "
            row.appendChild(child)
        }
    }

    selectItem(item: Item, index: number) {
        if (item.name != "..") {
            item.isSelected = !item.isSelected
            this.sortableControl!.updateItem(index)
        }
    }

    selectAll(items: Item[], startIndex: number, above: boolean) {
        items.forEach((item, index) => {
            if (item.name != "..") {
                item.isSelected = above ? index <= startIndex : index >= startIndex ? true : false
                this.sortableControl!.updateItem(index)
            }
        })
    }

    setSortable(sortableControl: ISortable) {
        this.sortableControl = sortableControl
    }

    protected onSort(sort: (itemA: Item, itemB: Item) => number, ascending: boolean) {
        var unsorted: Item[] = []
        var itemsToSort: Item[] = []
        const [items, currentIndex] = this.sortableControl!.getItemsToSort()
        const currentItem = items[currentIndex]
        items.forEach(item => {
            if (item.isDirectory || item.name == "..")
                unsorted.push(item)
            else
                itemsToSort.push(item)
        })

        if (itemsToSort.length > 0) {
            itemsToSort.sort((a, b) => {
                var result = sort(a, b)
                return ascending ? result : -result
            })
        }

        let newItemIndex = -1
        const sortedItems = unsorted.concat(itemsToSort)
        sortedItems.forEach((item, index) => {
            if (item.name == currentItem.name)
                newItemIndex = index
        })

        this.sortableControl!.setSortedItems(sortedItems, newItemIndex)
    }


    abstract columns: IColumn[]
    protected abstract appendColumns(row: HTMLTableRowElement, item: any): void
    protected sortableControl?: ISortable 

    private parentTemplate = (document.getElementById("it-parent") as HTMLTemplateElement).content.querySelector("td")!
    protected nameTemplate = (document.getElementById("it-iconName") as HTMLTemplateElement).content.querySelector("td")!
}