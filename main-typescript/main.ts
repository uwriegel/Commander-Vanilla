import { app, BrowserWindow, protocol } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as addon from 'addon'
import * as fs from "fs"
let win

//import * as schitt from 'addon'

function createWindow () {
    protocol.registerBufferProtocol('icon', (request, callback) => {
        const ext = decodeURI(request.url).substr(8)
        console.log(ext)
        // const text = "wörld 👌"
        // console.log(text); // 'world'
        // const text2 = addon.hello(text)
        // console.log(text2); // 'world'
        
        addon.getIcon(ext, (error, result) => {
            console.log(`kam zurück: ${ext} - ${result.byteLength}`)
            callback(result)
            // console.log("Callback:")
            // if (error) {
            //     console.log(error)
            //     return
            // }
            // fs.writeFileSync("./test24.png", result)
        })
                // getIcon(request.url, (err: any, res: Buffer) => {
        //     console.log(res)
        // })
        
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