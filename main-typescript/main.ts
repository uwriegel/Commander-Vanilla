import { app, BrowserWindow, protocol, Menu } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as settings from 'electron-settings'
import * as addon from 'addon'

app.on('ready', () => {
    protocol.registerBufferProtocol('icon', (request, callback) => {
        const ext = decodeURI(request.url).substr(7)
        addon.getIcon(ext, (error, result) => callback(result))
    }, (error) => {}
    )

    const bounds = JSON.parse(settings.get("window-bounds", 
        JSON.stringify({ 
            width: 800,
            height: 600
        }
    )) as string)


    // Erzeugung des Browser Fensters
    bounds.icon = path.join(__dirname, '../rendering/assets/images/kirk.png')
    const mainWindow = new BrowserWindow(bounds)

    if (settings.get("isMaximized"))
        mainWindow.maximize()
        
    const theme = settings.get("theme", "blue") as string

    // und Laden der index.html der App.
    mainWindow.loadURL(url.format({
        // Test sites:
        //pathname: path.join(__dirname, '../rendering/scrollbar.html'),
        //pathname: path.join(__dirname, '../rendering/columns.html'),
        //pathname: path.join(__dirname, '../rendering/iconview.html'),
        //pathname: path.join(__dirname, '../rendering/tableview.html'),
        //pathname: path.join(__dirname, '../rendering/grid.html'),
        pathname: path.join(__dirname, '../rendering/dialog.html'),
        //pathname: path.join(__dirname, '../rendering/conflictview.html'),

        //pathname: path.join(__dirname, '../rendering/commander.html'),

        protocol: 'file:',
        hash: theme,
        slashes: true
    }))

    mainWindow.on('resize', () => saveBounds())

    mainWindow.on('move', () => saveBounds())

    mainWindow.on('maximize', () => {
        settings.set("isMaximized", true)
    })

    mainWindow.on('unmaximize', () => {
        settings.set("isMaximized", false)
    })

    const menu = Menu.buildFromTemplate([
        {
            label: '&Datei',
            submenu: [{
                label: '&Umbenennen',
                accelerator: "F2"
            },
            {
                type: 'separator'
            },            
            {
                label: '&Kopieren',
                accelerator: "F5"
            },
            {
                label: '&Verschieben',
                accelerator: "F6"
            },
            {
                label: '&Löschen',
                accelerator: "F8"
            },
            {
                type: 'separator'
            },            
            {
                label: '&Eigenschaften',
                accelerator: "Alt+Enter"
            },
            {
                label: '&Beenden',
                accelerator: 'Alt+F4',
                role: "quit"
            }
        ]},
        {
            label: '&Navigation',
            submenu: [{
                label: '&Erstes Element',
                accelerator: 'Home'
            },
            {
                label: '&Favoriten',
                accelerator: 'F1'
            }
        ]},
        {
            label: '&Selection',
            submenu: [{
                label: '&Alles'
            },
            {
                label: '&Nichts'
            }
        ]},
        {
            label: '&Ansicht',
            submenu: [{
                label: '&Versteckte Dateien',
                accelerator: "Ctrl+H",
                type: "checkbox",
                click: evt =>  mainWindow.webContents.send("setShowHidden", evt.checked)
            },
            {
                type: 'separator'
            },            
            {
                label: '&Vorschau',
                accelerator: "F3",
                type: "checkbox",
                click: evt =>  mainWindow.webContents.send("viewer", evt.checked)
            },
            {
                type: 'separator'
            },            
            {
                label: '&Blaues Thema',
                type: "radio",
                checked: theme == "blue",
                click: () => {
                    mainWindow.webContents.send("setTheme", "blue")
                    settings.set("theme", "blue")  
                } 
            },
            {
                label: '&Hellblaues Thema',
                type: "radio",
                checked: theme == "lightblue",
                click: () => {
                    mainWindow.webContents.send("setTheme", "lightblue")
                    settings.set("theme", "lightblue")  
                } 
            },
            {
                label: '&Dunkles Thema',
                type: "radio",
                checked: theme == "dark",
                click: () => {
                    mainWindow.webContents.send("setTheme", "dark")
                    settings.set("theme", "dark")  
                } 
            },
            {
                type: 'separator'
            },            
            {
                label: '&Vollbild',
                click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
                accelerator: "F11"
            },
            {
                type: 'separator'
            },            
            {
                label: '&Entwicklerwerkzeuge',
                click: () => mainWindow.webContents.openDevTools(),
                accelerator: "F12"
            }
        ]}
    ])

    function saveBounds() {
        if (!mainWindow.isMaximized()) {
            const bounds = mainWindow.getBounds()
            settings.set("window-bounds", JSON.stringify(bounds))
        }
    }
    
    Menu.setApplicationMenu(menu)    
})

