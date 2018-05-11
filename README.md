# Commander
A Norton like Commander based on Electron and typescript

## To begin
* npm i
* .\node_modules\.bin\electron-rebuild.cmd
* compile typescript (main and rendering)
* npm start

## To build C++ Addon
* npm install node-gyp -g
* Install python 2.7
* npm install --global --production windows-build-tools  
in power shell mit Admin-Rechten
* npm install (to build node addon) 
* .\node_modules\.bin\electron-rebuild.cmd (to rebuild electron addon)

### Manual build of addon
* cd addon
* node-gyp configure 
* node-gyp build

## Test scenarios
### Include scrollbar.html in main.ts
You can only test the following:
* Resizing window: scrollbar appears and disappears
* Press upper and lower button: the scrollbar thumb will move
* Press the space between button and scrollbar thumb: thumb will move pagewise
* Move scrollbar thumb

Content will not be scrolled!
### Include columns.html in main.ts
Now the columns control can be tested

### Include iconview.html in main.ts
Retrieve several icons from Windows via C++ addon

### Include tableview.html in main.ts
Test tableview functionality, column sorting, scrolling, ...

