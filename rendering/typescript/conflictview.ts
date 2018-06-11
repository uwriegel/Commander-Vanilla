class ConflictView {
    constructor(parent: HTMLElement, conflictItems: ConflictItem[]) {
        parent.appendChild(this.tableParent)
        parent.classList.add('conflictTable')
        this.tableParent.style.flexGrow = "1"
        this.tableView = new TableView(this.tableParent, "conflict")

        this.conflictItems = new ConflictItems()
        this.tableView.setColumns(this.conflictItems.columns, "conflict")
        this.tableView.setItemsControl(this.conflictItems)
        this.tableParent.onfocus = () => this.tableView.focus()
        this.tableParent.tabIndex = 1

        setTimeout(() => this.tableView.setItems(conflictItems), 10)
    }

    get shouldNotBeOverridden() {
        return this.conflictItems.shouldNotBeOverridden
    }

    isTableView(elementToCheck: HTMLElement) {
        return this.tableParent.contains(elementToCheck)
    }

    readonly tableParent = document.createElement('div')

    private readonly tableView: TableView
    private readonly conflictItems: ConflictItems
}