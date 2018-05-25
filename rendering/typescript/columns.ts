export interface IColumn {
    name: string
    onSort?: (ascending: boolean)=>void
}

/**
 * Manages the tableview's columns
 */
export class Columns {
    constructor(private readonly tableView: HTMLElement) {
        const td = document.createElement("td")
        td.classList.add("it-name")
        const nameDiv = document.createElement("div")
        nameDiv.classList.add("it-iconName")
        const img = document.createElement("img")
        img.classList.add("it-image")
        img.alt = ""
        const span = document.createElement("span")
        span.classList.add("it-nameValue")
        nameDiv.appendChild(img)
        nameDiv.appendChild(span)
        td.appendChild(nameDiv)

        tableView.addEventListener('mousemove', evt => {
            const th = <HTMLElement>evt.target
            if (th.localName == "th" && (th.offsetLeft > 0 || evt.pageX - th.getBoundingClientRect().left > 10)
                && (th.offsetLeft + th.offsetWidth < tableView.offsetWidth || evt.pageX - th.getBoundingClientRect().left < 4)
                && (th.getBoundingClientRect().left + th.offsetWidth - evt.pageX < 4 || evt.pageX - th.getBoundingClientRect().left < 4)) {
                document.body.style.cursor = 'ew-resize'
                this.grippingReady = true
                this.previous = evt.pageX - th.getBoundingClientRect().left < 4
            }
            else {
                document.body.style.cursor = 'default'
                this.grippingReady = false
            }
        })
    }

    setColumns(columns: IColumn[], id: string) {
        this.columns = columns  
        this.id = id

        const ths = this.columns.map(col => {
            var th = document.createElement("th")
            th.innerHTML = col.name
            if (col.onSort)
                th.classList.add("column-selectable")
            return th
        })

        const thead = this.tableView.getElementsByTagName("thead")[0]
        thead.innerHTML = ""
        const trh = document.createElement("tr")
        trh.classList.add("columns")
        thead.appendChild(trh)
        ths.forEach(th => trh.appendChild(th))

        const json = localStorage[id]
        if (json) {
            const columnWidth = JSON.parse(json)
            this.setWidths(columnWidth)
        }
        else
            this.setWidths()

        Array.from(ths).forEach((th, columnIndex) => {
            th.onmousedown = evt => {
                const column = <HTMLElement>evt.target
                if (!this.grippingReady) {
                    if (this.columns[columnIndex].onSort) {
                        const ascending = column.classList.contains("sortAscending")
                        this.columns[columnIndex].onSort!(!ascending)
                        for (let i = 0; i < ths.length; i++) {
                            ths[i].classList.remove("sortAscending")
                            ths[i].classList.remove("sortDescending")
                        }

                        column.classList.add(ascending ? "sortDescending" : "sortAscending")
                    }
                }
                else
                    this.beginColumnDragging(evt.pageX, column)
            }
        })
    }

    beginColumnDragging(startGripPosition: number, targetColumn: HTMLElement) {
        document.body.style.cursor = 'ew-resize'

        let currentHeader: HTMLElement
        if (!this.previous)
            currentHeader = targetColumn
        else
            currentHeader = <HTMLElement>targetColumn.previousElementSibling
        const nextHeader = <HTMLElement>currentHeader.nextElementSibling
        const currentLeftWidth = currentHeader.offsetWidth
        const sumWidth = currentLeftWidth + nextHeader.offsetWidth

        const onmove = (evt: MouseEvent) => {
            document.body.style.cursor = 'ew-resize'

            var diff = evt.pageX - startGripPosition

            if (currentLeftWidth + diff < 15)
                diff = 15 - currentLeftWidth
            else if (diff > sumWidth - currentLeftWidth - 15)
                diff = sumWidth - currentLeftWidth - 15

            const combinedWidth = this.getCombinedWidth(currentHeader, nextHeader)

            let leftWidth = currentLeftWidth + diff
            let rightWidth = sumWidth - currentLeftWidth - diff
            const factor = combinedWidth / sumWidth
            leftWidth = leftWidth * factor
            rightWidth = rightWidth * factor

            currentHeader.style.width = leftWidth + '%'
            nextHeader.style.width = rightWidth + '%'
            const columnsWidths = this.getWidths()
            localStorage[this.id] = JSON.stringify(columnsWidths)

            evt.preventDefault()
        }

        const onup = (evt: MouseEvent) => {
            document.body.style.cursor = 'default'
            window.removeEventListener('mousemove', onmove)
            window.removeEventListener('mouseup', onup)
        }

        window.addEventListener('mousemove', onmove)
        window.addEventListener('mouseup', onup)
    }

    getWidths() {
        let widths = new Array()
        const ths = this.tableView.getElementsByTagName("th")
        Array.from(ths).forEach((th, i) => {
            widths[i] = th.style.width
            if (!widths[i])
                widths[i] = (100 / this.columns.length) + '%'
        })
        return widths
    }

    setWidths(widths?: string[]) {
        const ths = this.tableView.getElementsByTagName("th")

        if (!widths) {
            const width: number | string = 100 / ths.length
            widths = []
            for (let i = 0; i < ths.length; i++)
                widths.push(width + '%')
        }

        Array.from(ths).forEach((th, i) => {
            if (widths)
                th.style.width = widths[i]
        })
    }

    getCombinedWidth(column: HTMLElement, nextColumn: HTMLElement) {
        const firstWidth = column.style.width
            ? parseFloat(column.style.width.substr(0, column.style.width.length - 1))
            : 100 / this.columns.length
        const secondWidth = nextColumn.style.width
            ? parseFloat(nextColumn.style.width.substr(0, nextColumn.style.width.length - 1))
            : 100 / this.columns.length
        return firstWidth + secondWidth
    }

    private previous = false
    private columns: IColumn[] = []
    private id = ""
    private grippingReady = false
}