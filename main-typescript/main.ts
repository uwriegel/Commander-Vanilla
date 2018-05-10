import { app, BrowserWindow, protocol } from 'electron'
import * as path from 'path'
import * as url from 'url'
//var getIcon: ((extension: string, callback: (result: Buffer) => void)=> void) = require('../addon/build/Release/addon')
const addon = require('../addon/build/Release/addon')
let win

function createWindow () {
    console.log("Creating window")

    protocol.registerStringProtocol('icon', (request, callback) => {
        console.log(decodeURI(request.url));

        const text = "wörld 👌"

        const text2 = addon.hello(text)
        console.log(text2); // 'world'
        console.log("Guten Tag")

        // getIcon(request.url, (err: any, res: Buffer) => {
        //     console.log(res)
        // })
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