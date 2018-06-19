const addon2: Addon = require('addon')

async function fill() {
    const tableViewParent = document.getElementById("container")!
    const tableView = new TableView(tableViewParent, "Table")

    const path = "c:\\windows\\system32\\"
    //const path = "A:\\Bilder\\2008\\02 - Scharendijke\\"
    const columnItems = new DirectoryItems(path)
    tableView.setColumns(columnItems.columns, "testColumns")
    tableView.setItemsControl(columnItems)

    async function getItems(path: string)  {
        return new Promise<Item[]>((res, rej) => {
            addon2.readDirectory(path, (err, result) => {
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

    var result = await getItems(path)
    tableView.setItems(result)
    tableView.focus()
}

fill()

