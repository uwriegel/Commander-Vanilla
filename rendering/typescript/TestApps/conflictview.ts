var conflictItems = [{
    name: "EineDatei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 1234,
    targetFileSize: 1235,
    sourceVersion: "1.2.3.4",
    targetVersion: "1.2.5.4",
    sourceDateTime: new Date(),
    targetDateTime: new Date(2018, 3, 12, 10, 12, 3)
}, {
    name: "2.Datei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 1234,
    targetFileSize: 1234,
    sourceVersion: "1.22.3.4",
    targetVersion: "1.2.5.4",
    sourceDateTime: new Date(2018, 3, 12, 10, 12, 3),
    targetDateTime: new Date()
}, {
    name: "3.Datei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 123,
    targetFileSize: 1234,
    sourceVersion: "1.2.3.4",
    targetVersion: "1.2.3.4",
    sourceDateTime: new Date(),
    targetDateTime: new Date()
}, {
    name: "4.Datei.exe",
    isDirectory: false,
    isSelected: false,
    sourceFileSize: 1234,
    targetFileSize: 1234,
    sourceDateTime: new Date(),
    targetDateTime: new Date()
}]

const container = document.getElementById("container")!
const conflictView = new ConflictView(container, conflictItems)