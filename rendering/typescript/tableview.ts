import { Item } from './Item'
import { Scrollbar } from './scrollbar.js'
import { ISortable } from './ISortable'
import { IColumn, Columns } from './columns.js'
import { BaseItems } from './baseitems.js'
import { EmptyItems } from './EmptyItems.js';

export class TableView implements ISortable {

    /**
    * Listview mit mehreren Spalten
    *
    * @param parent Das Elternelement, das die Tableview beinhaltet
    * @param id
    */
    constructor(private parent: HTMLElement, id: string) {
        parent.style.position = "relative"
        this.table.classList.add('tableView')
        this.table.tabIndex = 1
        parent.appendChild(this.table)

        this.table.appendChild(this.thead)
        this.table.appendChild(this.tbody)

        this.scrollbar = new Scrollbar(parent, p => this.scroll(p))
        this.scrollbar.initialize(() => this.focus())

        window.addEventListener('resize', () => this.resizeChecking())

        this.table.addEventListener("focusin", () => {
            if (this.onFocus)
                this.onFocus()
            this.focus()
        })

        this.tbody.onmousedown = evt => {
            const tr = <HTMLTableRowElement>(<HTMLElement>evt.target).closest("tr")
            this.currentItemIndex = Array.from(this.tbody.querySelectorAll("tr")).findIndex(n => n == tr) + this.startPosition

            this.onCurrentItemChanged(this.currentItemIndex)

            if (!this.hasFocus())
                tr.focus()
            //else if (onToggleSelection)
            //    onToggleSelection(currentItemIndex)
        }

        this.table.onkeydown = e => {
            switch (e.which) {
                case 13: // Return
                    this.onSelectedCallback(e.ctrlKey, e.altKey)
                    break;
                case 33:
                    this.pageUp()
                    break
                case 34:
                    this.pageDown()
                    break
                case 35: // End
                    if (!e.shiftKey)
                        this.end()
                    break
                case 36: //Pos1
                    if (!e.shiftKey)
                        this.pos1()
                    break
                case 38:
                    this.upOne()
                    break
                case 40:
                    this.downOne()
                    break
                default:
                    return // exit this handler for other keys
            }
            e.preventDefault() // prevent the default action (scroll / move caret)
        }

        this.tbody.ondblclick = () => this.onSelectedCallback(false, false)

        this.tbody.addEventListener('mousewheel', evt => {
            var wheelEvent = <WheelEvent>evt
            var delta = wheelEvent.wheelDelta / Math.abs(wheelEvent.wheelDelta) * 3
            this.scroll(this.startPosition - delta)
        })

        this.resizeChecking()
    }

    onCurrentItemChanged: (itemIndex: number) => void = i=>{}
    onSelectedCallback: (openWith: boolean, showProperties: boolean) => void = (o, sp)=>{}

    setColumns(columns: IColumn[], columnsId: string) {
        this.columns.setColumns(columns, columnsId)
    }

    setOnFocus(callback: () => void) {
        this.onFocus = callback
    }

    setItems(items: Item[]) {
        this.items = items
        this.clearItems()
        this.displayItems(0)
    }

    setItemsControl(items: BaseItems) {
        this.itemsControl = items
        items.setSortable(this)
    }

    getItemsToSort(): [Item[], number] {
        return [this.items, this.currentItemIndex]
    }

    setSortedItems(items: Item[], newItemIndex: number) {
        const focus = this.hasFocus()
        if (newItemIndex != -1)
            this.currentItemIndex = newItemIndex
        this.setItems(items)
        this.scrollIntoView()
        if (focus)
            this.focus()
    }

    hasFocus() {
        return this.table.contains(document.activeElement)
    }

    updateItems(update: (items: Item[])=>void) {
        const focus = this.hasFocus()
        update(this.items)
        this.clearItems()
        this.displayItems(this.startPosition)
        if (focus)
            this.focus()
    }

    /**
     * Setzen des Focuses
     * @returns true, wenn der Fokus gesetzt werden konnte
     */
    focus(): boolean {
        this.onCurrentItemChanged(this.currentItemIndex)

        const index = this.currentItemIndex - this.startPosition
        if (index >= 0 && index < this.tableCapacity) {
            const trs = this.tbody.querySelectorAll('tr')
            if (index < trs.length) {
                trs[index].focus()
                return true
            }
        }
        this.table.focus()
        return false
    }

    resizeChecking() {
        if (this.parent.clientHeight != this.recentHeight) {
            const isFocused = this.table.contains(document.activeElement)
            this.recentHeight = this.parent.clientHeight
            const tableCapacityOld = this.tableCapacity
            this.calculateTableHeight()
            const itemsCountOld = Math.min(tableCapacityOld + 1, this.items.length - this.startPosition)
            const itemsCountNew = Math.min(this.tableCapacity + 1, this.items.length - this.startPosition)
            if (itemsCountNew < itemsCountOld) {
                for (i = itemsCountOld - 1; i >= itemsCountNew; i--)
                    this.tbody.children[i].remove()
            }
            else
                for (var i = itemsCountOld; i < itemsCountNew; i++) {
                    const node = this.itemsControl.createItem(this.items[i + this.startPosition])
                    this.tbody.appendChild(node)
                }

            this.scrollbar.itemsChanged(this.items.length, this.tableCapacity)
            this.table.style.clip = `rect(0px, auto, ${this.recentHeight}px, 0px)`

            if (isFocused)
                focus()
        }
    }

    private clearItems() {
        const focus = this.hasFocus()
        this.tbody.innerHTML = ''
        if (focus)
            this.table.focus()
    }

    private displayItems(start: number) {
        this.startPosition = start

        if (this.tableCapacity == -1) {
            this.initializeRowHeight()
            this.calculateTableHeight()
        }

        const end = Math.min(this.tableCapacity + 1 + this.startPosition, this.items.length)
        for (let i = this.startPosition; i < end; i++) {
            var node = this.itemsControl.createItem(this.items[i])
            this.tbody.appendChild(node)
        }

        this.scrollbar.itemsChanged(this.items.length, this.tableCapacity, this.startPosition)
    }

    private initializeRowHeight() {
        const node = this.itemsControl.createItem()
        this.tbody.appendChild(node)
        const td = this.tbody.querySelector('td')!
        this.rowHeight = td.clientHeight
        this.clearItems()
    }

    private calculateTableHeight() {
        if (this.rowHeight) {
            this.tableCapacity = Math.floor((this.parent.offsetHeight - this.thead.offsetHeight) / this.rowHeight) 
            if (this.tableCapacity < 0)
                this.tableCapacity = 0
        }
        else
            this.tableCapacity = -1
        this.scrollbar.itemsChanged(0, this.tableCapacity)
    }
    
    private scroll(position: number) {
        if (this.items.length < this.tableCapacity)
            return
        if (position < 0)
            position = 0
        else if (position > this.items.length - this.tableCapacity)
            position = this.items.length - this.tableCapacity
        this.startPosition = position
        this.clearItems()
        this.displayItems(this.startPosition)

        const selector = this.currentItemIndex - this.startPosition
        if (selector >= 0 && selector < this.tableCapacity)
            this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        else
            this.table.focus()
    }

    private upOne() {
        if (this.currentItemIndex == 0)
            return
        this.scrollIntoView()

        this.currentItemIndex--
        if (this.currentItemIndex - this.startPosition < 0) {
            if (this.currentItemIndex + this.tableCapacity < this.items.length - 1) {
                const trs = this.tbody.querySelectorAll('tr')
                trs[trs.length - 1].remove()
            }
            if (this.currentItemIndex >= 0) {
                this.startPosition -= 1
                this.scrollbar.setPosition(this.startPosition)
                const node = this.itemsControl.createItem(this.items[this.currentItemIndex])
                this.tbody.insertBefore(node, this.tbody.firstChild)
            }
        }

        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
    }

    downOne() {
        if (this.currentItemIndex == this.items.length - 1)
            return false

        this.scrollIntoView()

        this.currentItemIndex++
        if (this.currentItemIndex - this.startPosition >= this.tableCapacity) {
            this.tbody.querySelector('tr')!.remove()
            this.startPosition += 1
            this.scrollbar.setPosition(this.startPosition)
            if (this.currentItemIndex < this.items.length - 1) {
                const node = this.itemsControl.createItem(this.items[this.currentItemIndex + 1])
                this.tbody.appendChild(node)
            }
        }
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
        return true
    }

    updateItem(index: number) {
        const row = this.tbody.querySelectorAll('tr')[index - this.startPosition]
        if (row)
            this.itemsControl.updateRow(row, this.items[index])
    }

    pageUp() {
        if (this.currentItemIndex == 0)
            return

        this.scrollIntoView()

        if (this.currentItemIndex - this.startPosition > 0)
            this.currentItemIndex = this.startPosition
        else {
            this.currentItemIndex -= this.tableCapacity
            if (this.currentItemIndex < 0)
                this.currentItemIndex = 0
            this.clearItems()
            this.displayItems(this.currentItemIndex)
        }

        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
    }

    pageDown() {
        if (this.currentItemIndex == this.items.length - 1)
            return

        this.scrollIntoView()

        if (this.currentItemIndex - this.startPosition < this.tableCapacity - 1) {
            this.currentItemIndex = Math.min(this.tableCapacity, this.items.length) - 1 + this.startPosition
            if (this.currentItemIndex >= this.items.length)
                this.currentItemIndex = this.items.length - 1
        }
        else {
            this.currentItemIndex += this.tableCapacity
            if (this.currentItemIndex >= this.items.length)
                this.currentItemIndex = this.items.length - 1
            this.clearItems()
            this.displayItems(this.currentItemIndex - this.tableCapacity + 1)
        }

        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
    }

    pos1() {
        this.clearItems()
        this.displayItems(0)
        this.currentItemIndex = 0
        this.tbody.querySelectorAll('tr')[0].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
    }

    end() {
        this.clearItems()
        this.currentItemIndex = this.items.length - 1
        let startPos = this.currentItemIndex - this.tableCapacity + 1
        if (startPos < 0)
            startPos = 0
        this.displayItems(startPos)
        this.tbody.querySelectorAll('tr')[this.currentItemIndex - this.startPosition].focus()
        this.onCurrentItemChanged(this.currentItemIndex)
    }

    scrollIntoView() {
        const selector = this.currentItemIndex - this.startPosition;
        if (selector < 0)
            this.scroll(this.currentItemIndex)
        else if (selector >= this.tableCapacity) {
            this.scroll(this.currentItemIndex)
            this.scroll(this.currentItemIndex - this.tableCapacity + 1)
        }
    }

    private readonly table = document.createElement("table")
    private readonly tbody = document.createElement("tbody")
    private readonly thead = document.createElement("thead")
    private readonly scrollbar: Scrollbar
    private readonly columns = new Columns(this.table)
    private items: Item[] = []
    private itemsControl: BaseItems = new EmptyItems()
    private recentHeight = this.table.clientHeight

    //private columns = new Columns([], "tableView", this.table)
    private onFocus = () => { }
    /**
    * Index des aktuellen Eintrags in der Liste der Einträge (items)
    */
    private currentItemIndex = 0
    private startPosition = 0
    /**
    * Die Anzahl der Einträge, die dieses TableView in der momentanen Größe tatsächlich auf dem Bildschirm anzeigen kann
    */
    private tableCapacity = -1
    private rowHeight = 0
}


//    let presenter: Presenter
//    let items: Items = createEmptyItems()
//    let columnsControl: ColumnsControl




//    let onToggleSelection: (itemIndex: number) => void












//    

//    {
//        let tr = document.createElement("tr")
//        thead.appendChild(tr)
//    }




    

//    const getId = () => id


//    function getCurrentItemIndex() {
//        return currentItemIndex
//    }

//    function ItemsCleared() {
//        currentItemIndex = 0
//        clearItems()
//    }

//    function itemsChanged(lastCurrentIndex: number) {
//        ItemsCleared()
//        currentItemIndex = lastCurrentIndex
//        displayItems(0)

//        if (tableView == document.activeElement)
//            focus()
//        scrollIntoView()
//    }

//    function updateItems() {
//        const trs = tbody.querySelectorAll('tr')
//        for (let i = 0; i < trs.length; i++)
//            presenter.updateItem(trs[i], items.getItem(i + startPosition))
//    }

//    function updateSelections() {
//        const trs = tbody.querySelectorAll('tr')
//        for (let i = 0; i < trs.length; i++)
//            presenter.updateSelection(trs[i], items.getItem(i + startPosition))
//    }

//    function updateSelection(itemIndex: number) {
//        const item = tbody.querySelectorAll('tr')[itemIndex - startPosition]
//        presenter.updateSelection(item, items.getItem(itemIndex))
//    }

//    function setOnToggleSelection(callback: (itemIndex: number) => void) {
//        onToggleSelection = callback
//    }



//        tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
//        if (onCurrentItemChanged)
//            onCurrentItemChanged(currentItemIndex)
//        return true
//    }

//    function isMouseWithin(x: number, y: number): boolean {
//        const rect = tableView.getBoundingClientRect()
//        rect.left, rect.top, rect.width, rect.bottom

//        //console.log(`${x} ${y} ${rectObject.left} ${rectObject.top} ${rectObject.width} ${rectObject.bottom}`)

//        const result = (x > rect.left && x < (rect.left + rect.width)
//            && y > rect.top && y < (rect.top + rect.bottom))
//        if (result)
//            tableView.classList.add("highlight")
//        else
//            tableView.classList.remove("highlight")
//        return result
//    }

//    function dragLeave() {
//        tableView.classList.remove("highlight")
//    }

//    function setColumns(value: ColumnsControl) {
//        columnsControl = value

//        const theadrow = thead.querySelector('tr')!
//        theadrow.innerHTML = ""
//        columnsControl.initializeEachColumn(item => {
//            const th = document.createElement("th")
//            th.innerHTML = item
//            theadrow.appendChild(th)
//        })

//        columnsControl.initialize(tableView, view)
//    }


//    function insertItem(index: number): HTMLTableRowElement {
//        return presenter.insertItem(items.getItem(index))
//    }







//    const view = {
//        getId: getId,
//        setPresenter: setPresenter,
//        setItems: setItems,
//        getItems: getItems,
//        getCurrentItemIndex: getCurrentItemIndex,
//        ItemsCleared: ItemsCleared,
//        itemsChanged: itemsChanged,
//        updateItems: updateItems,
//        updateSelections: updateSelections,
//        updateSelection: updateSelection,
//        setOnFocus: setOnFocus,
//        setOnToggleSelection: setOnToggleSelection,
//        focus: focus,
//        downOne: downOne,
//        isMouseWithin: isMouseWithin,
//        dragLeave: dragLeave,
//        setColumns: setColumns
//    }

//    return view
//}
