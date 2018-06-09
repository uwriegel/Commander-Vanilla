const button = document.getElementById("test")!
button.onclick = evt => {
    const dialog = new Dialog("Das ist der Dialog")
    dialog.show()
}