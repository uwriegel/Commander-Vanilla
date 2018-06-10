class ConflictView {
    constructor(parent: HTMLElement, conflictItems: ConflictItem[]) {
        parent.appendChild(this.tableParent)
        this.tableParent.style.flexGrow = "1"
        this.tableView = new TableView(this.tableParent, "conflict")

        const items = new ConflictItems()
        this.tableView.setColumns(items.columns, "conflict")
        this.tableView.setItemsControl(items)
        this.tableView.setItems(conflictItems)
    }

    private readonly tableParent = document.createElement('div')
    private readonly tableView: TableView
}