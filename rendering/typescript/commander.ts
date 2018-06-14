// TODO: verkleinern, nach unten scrollen, dann Fenster vergrößern => Scrollbar verschwindet, aber erstes Item nicht sichtbar!!

const {ipcRenderer} = require('electron')
const Path = require('path')
const addon: Addon = require('addon')

class Commander {
    constructor() {
        const theme = location.hash.substr(1)
        if (theme)
            this.setTheme(theme)

        this.commanderViewLeft.setOnFocus(() => this.focusedView = this.commanderViewLeft)
        this.commanderViewRight.setOnFocus(() => this.focusedView = this.commanderViewRight)
        this.commanderViewLeft.focus()
        this.commanderViewLeft.changePath("c:\\windows\\system32")
        this.commanderViewRight.changePath("c:")

        Grid.create(this.vgrip, this.grid, this.viewer.HtmlElement, true, () => {
            this.commanderViewLeft.onResize()
            this.commanderViewRight.onResize()
        })
        Grid.create(this.grip, this.leftView, this.rightView, false, () => { })

        this.commanderViewLeft.onCurrentItemChanged = (item, path) => this.currentItemChanged(item, path)
        this.commanderViewRight.onCurrentItemChanged = (item, path) => this.currentItemChanged(item, path)

        ipcRenderer.on("setTheme", (_: any, theme: string) => this.setTheme(theme))
        ipcRenderer.on("viewer", (_: any, on: boolean) => {
            if (on) {
                this.vgrip.classList.remove("hidden")
                this.viewer.Hidden = false
            }
            else {
                this.vgrip.classList.add("hidden")
                this.viewer.Hidden = true
                this.grid.style.flex = null
            }
            this.commanderViewLeft.onResize()
            this.commanderViewRight.onResize()
        })
        ipcRenderer.on("setShowHidden", (_: any, on: boolean) => {
            GlobalSettings.showHidden = on
            this.commanderViewLeft.refresh()
            this.commanderViewRight.refresh()
        })
        ipcRenderer.on("createFolder", () => this.focusedView.createFolder())

        this.initializeOnKeyDownHandler()
    }

    private setTheme(theme: string) {
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
   
    private grid = document.getElementById("grid")!
    private vgrip = document.getElementById("vgrip")!
    private grip = document.getElementById("grip")!
    private leftView = document.getElementById("leftView")!
    private rightView = document.getElementById("rightView")!
    private footer = document.getElementById("footer")!
        
    private commanderViewLeft = new CommanderView(this.leftView, "leftView")
    private commanderViewRight = new CommanderView(this.rightView, "rightView")
    
    private currentItemChanged(item: Item, path: string) {
        if (item) {
            const text = Path.join(path, item.name)
            this.footer.textContent = text
            this.viewer.selectionChanged(text)
        }
        else {
            this.footer.textContent = "Nichts selektiert"
            this.viewer.selectionChanged("")
        }
    }
    
    private initializeOnKeyDownHandler() {
        document.onkeydown = evt => {
            switch (evt.which) {
                case 9: // TAB
                    if (!evt.shiftKey) {
                        if (this.focusedView.isDirectoryInputFocused())
                            this.focusedView.focus()
                        else {
                            const toFocus = this.focusedView == this.commanderViewLeft ? this.commanderViewRight : this.commanderViewLeft
                            toFocus.focus()
                        }
                    }
                    else
                        this.focusedView.focusDirectoryInput()
                    break
                default:
                    return
            }
            evt.preventDefault()
        }
    }
    
    private focusedView = this.commanderViewLeft
    private viewer = new Viewer()
}
new Commander()