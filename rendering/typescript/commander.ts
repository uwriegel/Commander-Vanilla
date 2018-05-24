import { ipcRenderer } from "electron"
import * as Path from 'path'
import { CommanderView } from './CommanderView.js'
import { createGrid } from './grid.js'
import { Item } from './item.js'
import { setShowHidden } from './globalsettings'

// TODO: Drive items
// TODO: Version
// TODO: Exif
// TODO: exe-icons

function setTheme(theme: string) {
    localStorage["theme"] = theme

    let styleSheet = document.getElementById("dark")
    if (styleSheet)
        styleSheet.remove()
    styleSheet = document.getElementById("blue")
    if (styleSheet)
        styleSheet.remove()
    styleSheet = document.getElementById("lightblue")
    if (styleSheet)
        styleSheet.remove()

    const head = document.getElementsByTagName('head')[0]
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.id = 'theme'
    link.type = 'text/css'
    link.href = `assets/css/themes/${theme}.css`
    link.media = 'all'
    head.appendChild(link)
}

setTheme(localStorage["theme"] || "blue")

const grid = document.getElementById("grid")!
const vgrip = document.getElementById("vgrip")!
const grip = document.getElementById("grip")!
const viewer = document.getElementById("viewer")!
const leftView = document.getElementById("leftView")!
const rightView = document.getElementById("rightView")!
const footer = document.getElementById("footer")!

var commanderViewLeft = new CommanderView(leftView, "leftView")
var commanderViewRight = new CommanderView(rightView, "rightView")
commanderViewLeft.setOnFocus(() => focusedView = commanderViewLeft)
commanderViewRight.setOnFocus(() => focusedView = commanderViewRight)
commanderViewLeft.focus()
commanderViewLeft.changePath("c:\\windows\\system32")
commanderViewRight.changePath("c:")

createGrid(vgrip, grid, viewer, true, () => {
    commanderViewLeft.onResize()
    commanderViewRight.onResize()
})
createGrid(grip, leftView, rightView, false, () => { })

commanderViewLeft.onCurrentItemChanged = currentItemChanged
commanderViewRight.onCurrentItemChanged = currentItemChanged

ipcRenderer.on("setTheme", (_: any, theme: string) => setTheme(theme))
ipcRenderer.on("viewer", (_: any, on: boolean) => {
    if (on) {
        vgrip.classList.remove("hidden")
        viewer.classList.remove("hidden")
    }
    else {
        vgrip.classList.add("hidden")
        viewer.classList.add("hidden")
        grid.style.flex = null
    }
    commanderViewLeft.onResize()
    commanderViewRight.onResize()
})
ipcRenderer.on("setShowHidden", (_: any, on: boolean) => {
    setShowHidden(on)
    commanderViewLeft.refresh()
    commanderViewRight.refresh()
})

function currentItemChanged(item: Item, path: string) {
    if (item) {
        const text = Path.join(path, item.name)
        footer.textContent = text
        //viewer.selectionChanged(text)
    }
    else {
        footer.textContent = "Nichts selektiert"
        //viewer.selectionChanged("")
    }
}

function initializeOnKeyDownHandler() {
    document.onkeydown = evt => {
        switch (evt.which) {
            case 9: // TAB
                if (!evt.shiftKey) {
                    if (focusedView.isDirectoryInputFocused())
                        focusedView.focus()
                    else {
                        const toFocus = focusedView == commanderViewLeft ? commanderViewRight : commanderViewLeft
                        toFocus.focus()
                    }
                }
                else
                    focusedView.focusDirectoryInput()
                break
            default:
                return
        }
        evt.preventDefault()
    }
}
initializeOnKeyDownHandler()

var focusedView = commanderViewLeft