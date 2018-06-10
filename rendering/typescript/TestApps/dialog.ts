const button = document.getElementById("test")!
button.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog")
    var result = await dialog.show()
    console.log(result)
}

const testOkCancel = document.getElementById("testOkCancel")!
testOkCancel.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog OK Cancel")
    dialog.setOkCancel()
    var result = await dialog.show()
    console.log(result)
}

const testYesNo = document.getElementById("testYesNo")!
testYesNo.onclick = async evt => {
    const dialog = new Dialog("Das ist der Ja/Nein-Dialog")
    dialog.setYesNoCancel()
    var result = await dialog.show()
    console.log(result)
}

const testOkCancelCheck = document.getElementById("testOkCancelCheck")!
testOkCancelCheck.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog OK Cancel mit CheckBox")
    dialog.setOkCancel()
    dialog.setCheckBox("Gecheckt?")
    var result = await dialog.show()
    if (result == DialogResult.OK)
        console.log(dialog.isChecked)
}

const testOkCancekInput = document.getElementById("testOkCancekInput")!
testOkCancekInput.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog Ja/Nein mit CheckBox")
    dialog.setOkCancel()
    dialog.setInput("Ein Input")
    var result = await dialog.show()
    if (result == DialogResult.OK)
        console.log(dialog.textInput)
}

const testYesNoInputCheck = document.getElementById("testYesNoInputCheck")!
testYesNoInputCheck.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog Ja/Nein mit CheckBox und Input")
    dialog.setYesNoCancel()
    dialog.setInput("Ein Input")
    dialog.setCheckBox("Is das gecheckt?")
    var result = await dialog.show()
    console.log(result)
    if (result == DialogResult.OK) {
        console.log(dialog.isChecked)
        console.log(dialog.textInput)
    }
}

const conflictItems = [{
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

const conflict = document.getElementById("conflict")!
conflict.onclick = async evt => {
    const dialog = new Dialog("Das ist der Konflikte-Dialog")
    dialog.addConflictView(conflictItems)
    dialog.setYesNoCancel()
    var result = await dialog.show()
    console.log(result)
}

