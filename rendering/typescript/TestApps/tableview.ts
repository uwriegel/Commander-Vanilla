import { Item } from '../Item.js'
import { TableView } from '../tableView.js'
import { DirectoryItems } from '../DirectoryItems.js'
//import { DirectoryItem } from '../DirectoryItem.js';

interface TestItem extends Item {
    erw: string
    date: string
    size: number
}

function withoutService() {
    const tableViewParent = document.getElementById("container")!
    const tableView = new TableView(tableViewParent, "Table")

    const columnItems = new DirectoryItems("c:\\windows\\")
    tableView.setColumns(columnItems.columns, "testColumns")
    tableView.setItemsControl(columnItems)

    var items: TestItem[] = [{
        name: "Test",
        isDirectory: false,
        isSelected: false,
        erw: "txt",
        date: "25.02.1999 14:23",
        size: 123.567
    }, {
        name: "Bild",
        isDirectory: false,
        isSelected: false,
        erw: "jpg",
        date: "15.12.2009 12: 39",
        size: 678.435
    }]
    tableView.setItems(items)
}

withoutService()

// async function withService() {
//     const tableViewParent = document.getElementById("container")!
//     const tableView = new TableView(tableViewParent, "Table")

//     //const path = "c:\\windows\\system32\\"
//     const path = "A:\\Bilder\\2008\\02 - Scharendijke\\"
//     const columnItems = new DirectoryItems(path)
//     tableView.setColumns(columnItems.columns, "testColumns")
//     tableView.setItemsControl(columnItems)

//     const connection = new Connection(u => {
//         if (connection.getIndex() == u.index)
//             tableView.updateItems(items => u.updateItems.forEach((updateItem, index) => {
//                 const di = items[updateItem.index] as DirectoryItem
//                 di.version = updateItem.version
//                 di.exifDateTime = updateItem.dateTime
//             }))   
        
//     })
//     const result = await connection.getDirectoryItems(path)
//     //const result = await connection.getDirectoryItems("c:\\")
//     tableView.setItems(result.items)
    

//     tableView.focus()
// }

// const runWithService = true

// if (runWithService)
//     withService()
// else
//     withoutService()
