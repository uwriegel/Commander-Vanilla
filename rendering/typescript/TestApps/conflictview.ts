var conflictItems = [{
    name: "EineDatei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 1234,
    targetFileSize: 1235,
    // sourceVersion: string
    // targetVersion: string
    sourceDateTime: new Date(),
    targetDateTime: new Date()
}, {
    name: "2.Datei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 1234,
    targetFileSize: 1235,
    // sourceVersion: string
    // targetVersion: string
    sourceDateTime: new Date(),
    targetDateTime: new Date()
}]

const container = document.getElementById("container")!
const conflictView = new ConflictView(container, conflictItems)