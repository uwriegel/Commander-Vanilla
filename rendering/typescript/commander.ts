import { CommanderView } from './CommanderView.js'
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

// const grid = document.getElementById("grid")!
// const vgrip = document.getElementById("vgrip")!
// const grip = document.getElementById("grip")!
// const viewer = document.getElementById("viewer")!
const leftView = document.getElementById("leftView")!
const rightView = document.getElementById("rightView")!

var commanderViewLeft = new CommanderView(leftView, "leftView")
var commanderViewRight = new CommanderView(rightView, "rightView")
commanderViewLeft.setOnFocus(() => focusedView = commanderViewLeft)
commanderViewRight.setOnFocus(() => focusedView = commanderViewRight)
commanderViewLeft.focus()
commanderViewLeft.setPath("c:\\")
commanderViewRight.setPath("c:\\windows\\system32\\")

var focusedView = commanderViewLeft