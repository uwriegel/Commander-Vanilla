import { Item } from '../Item.js'
import { TableView } from '../tableView.js'
import { DirectoryItems } from '../DirectoryItems.js'
import * as addon from 'addon'

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

async function withService() {
    const tableViewParent = document.getElementById("container")!
    const tableView = new TableView(tableViewParent, "Table")

    const path = "c:\\windows\\system32\\"
    //const path = "A:\\Bilder\\2008\\02 - Scharendijke\\"
    const columnItems = new DirectoryItems(path)
    tableView.setColumns(columnItems.columns, "testColumns")
    tableView.setItemsControl(columnItems)

    async function getItems(path: string)  {
        return new Promise<Item[]>((res, rej) => {
            addon.readDirectory(path, (err, result) => {
                res(result.map(item => {
                    return {
                        name: item.name,
                        isDirectory: item.isDirectory,
                        isSelected: false,
                        isHidden: item.isHidden,
                        dateTime: item.time as any,
                        fileSize: item.size    
                    }     
                }))
            })
        })
    }

    // const connection = new Connection(u => {
    //     if (connection.getIndex() == u.index)
    //         tableView.updateItems(items => u.updateItems.forEach((updateItem, index) => {
    //             const di = items[updateItem.index] as DirectoryItem
    //             di.version = updateItem.version
    //             di.exifDateTime = updateItem.dateTime
    //         }))   
        
    // })
    // const result = await connection.getDirectoryItems(path)
    //const result = await connection.getDirectoryItems("c:\\")
    var result = await getItems(path)
    tableView.setItems(result)
    tableView.focus()
}

const runWithService = true

if (runWithService)
    withService()
else
    withoutService()
