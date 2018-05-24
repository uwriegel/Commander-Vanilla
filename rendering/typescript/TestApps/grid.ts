import { ipcRenderer } from "electron"
import { createGrid } from '../grid.js'

const grid = document.getElementById("grid")!
const vgrip = document.getElementById("vgrip")!
const grip = document.getElementById("grip")!
const viewer = document.getElementById("viewer")!
const leftView = document.getElementById("leftView")!
const rightView = document.getElementById("rightView")!

createGrid(vgrip, grid, viewer, true, () => {})
createGrid(grip, leftView, rightView, false, () => { })

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
})
