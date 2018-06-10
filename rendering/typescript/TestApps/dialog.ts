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

const testOkCancelCheck = document.getElementById("testOkCancelCheck")!
testOkCancelCheck.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog OK Cancel mit CheckBox")
    dialog.setOkCancel()
    dialog.setCheckBox("Gecheckt?")
    var result = await dialog.show()
    if (result == DialogResult.OK)
        console.log(dialog.isChecked)
}

const testYesNoInput = document.getElementById("testYesNoInput")!
testYesNoInput.onclick = async evt => {
    const dialog = new Dialog("Das ist der Dialog OK Cancel mit CheckBox")
    dialog.setOkCancel()
    dialog.setInput("Ein Input")
    var result = await dialog.show()
    if (result == DialogResult.OK)
        console.log(dialog.isChecked)
}
