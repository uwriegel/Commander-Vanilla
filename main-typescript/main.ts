import { app, BrowserWindow} from 'electron'
import * as path from 'path'
import * as url from 'url'

let win

function createWindow () {
    console.log("Creating window")

    // Erzeugung des Browser Fensters
    win = new BrowserWindow({width: 800, height: 600})

    // und Laden der index.html der App.
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../rendering/scrollbar.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools()
}

app.on('ready', createWindow)