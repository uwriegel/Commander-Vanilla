import { app, BrowserWindow, protocol } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as addon from 'addon'
import * as fs from "fs"

let win

function createWindow () {
    protocol.registerBufferProtocol('icon', (request, callback) => {
        const ext = decodeURI(request.url).substr(7)
        addon.getIcon(ext, (error, result) => callback(result))
    }, (error) => {}
    )

    console.log("Creating window")

    // Erzeugung des Browser Fensters
    win = new BrowserWindow({width: 800, height: 600})

    // und Laden der index.html der App.
    win.loadURL(url.format({
        //pathname: path.join(__dirname, '../rendering/scrollbar.html'),
        //pathname: path.join(__dirname, '../rendering/columns.html'),
        //pathname: path.join(__dirname, '../rendering/tableview.html'),
        pathname: path.join(__dirname, '../rendering/iconview.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools()
}

app.on('ready', createWindow)