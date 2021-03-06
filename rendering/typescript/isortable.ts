interface ISortable {
    getItemsToSort(): [Item[], number]
    setSortedItems(items: Item[], newItemIndex: number): void
    updateItem(index: number): void
}