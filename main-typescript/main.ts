import { app, BrowserWindow, protocol } from 'electron'
import * as path from 'path'
import * as url from 'url'

let win

function createWindow () {
    console.log("Creating window")

    protocol.registerStringProtocol('icon', (request, callback) => {
        console.log(decodeURI(request.url));
        callback("Affenköpf")
    }, (error) => {}
    )


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