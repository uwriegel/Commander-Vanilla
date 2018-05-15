import { CommanderView } from './CommanderView.js'
import { createGrid } from './grid.js'
// TODO: Mouse click: same as enter
// TODO: Directory append in DirectoryItems
// TODO: final \\ in addon
// TODO: parent ..: select parentDirectory
// TODO: Highlight color selected items
// TODO: adapt grip color on menu
// TODO: Theme choice per menu
// TODO: Gridviews

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

var commanderViewLeft = new CommanderView(leftView, "leftView")
var commanderViewRight = new CommanderView(rightView, "rightView")
commanderViewLeft.setOnFocus(() => focusedView = commanderViewLeft)
commanderViewRight.setOnFocus(() => focusedView = commanderViewRight)
commanderViewLeft.focus()
commanderViewLeft.changePath("c:\\windows\\system32\\")
commanderViewRight.changePath("c:\\")

createGrid(vgrip, grid, viewer, true, () => {
    commanderViewLeft.onResize()
    commanderViewRight.onResize()
})
createGrid(grip, leftView, rightView, false, () => { })

function initializeOnKeyDownHandler() {
    document.onkeydown = evt => {
        switch (evt.which) {
            case 9: // TAB
                if (!evt.shiftKey) {
//                    if (focusedView.isDirectoryInputFocused())
//                        focusedView.focus()
//                    else {
                    const toFocus = focusedView == commanderViewLeft ? commanderViewRight : commanderViewLeft
                        toFocus.focus()
//                    }
                }
                //else
                //    focusedView.focusDirectoryInput()
                break
            default:
                return
        }
        evt.preventDefault()
    }
}
initializeOnKeyDownHandler()

var focusedView = commanderViewLeft