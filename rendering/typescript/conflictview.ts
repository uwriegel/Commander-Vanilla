class ConflictView {
    constructor(parent: HTMLElement, conflictItems: ConflictItem[]) {
        parent.appendChild(this.tableParent)
        parent.classList.add('conflictTable')
        this.tableParent.style.flexGrow = "1"
        this.tableView = new TableView(this.tableParent, "conflict")

        const items = new ConflictItems()
        this.tableView.setColumns(items.columns, "conflict")
        this.tableView.setItemsControl(items)
        this.tableParent.onfocus = () => this.tableView.focus()
        this.tableParent.tabIndex = 1

        setTimeout(() => this.tableView.setItems(conflictItems), 100)
    }

    isTableView(elementToCheck: HTMLElement) {
        return this.tableParent.contains(elementToCheck)
    }

    readonly tableParent = document.createElement('div')

    private readonly tableView: TableView
}