enum DialogResult {
    Cancel,
    OK,
    No
}

// TODO: Conflictitems

class Dialog {
    isChecked = false
    textInput = ""

    constructor(text: string) {
        this.shader.classList.add("shader")
        document.body.appendChild(this.shader)

        this.dialog.classList.add("dialog")
        this.dialog.textContent = text
        this.dialog.appendChild(this.buttonList)
        
        this.ok.setAttribute("tabindex", "0")
        this.ok.classList.add("dialogButton")
        this.ok.textContent = "OK"
        this.ok.onclick = () => this.endDialog(DialogResult.OK)
        this.ok.onkeyup = evt => {
            if (evt.which == 32) 
                this.endDialog(DialogResult.OK)
        }

        const li = document.createElement('li')
        this.buttonList.appendChild(li)
        li.appendChild(this.ok)

        document.addEventListener('keydown', this.keydown, true)
    }

    setOkCancel() {
        this.cancel = document.createElement('div')
        this.cancel.setAttribute("tabindex", "0")
        this.cancel.classList.add("dialogButton")
        this.cancel.textContent = "Abbrechen"
        this.cancel.onclick = () => this.endDialog(DialogResult.Cancel)
        this.cancel.onkeyup = evt => {
            if (evt.which == 32) 
                this.endDialog(DialogResult.Cancel)
        }

        const li = document.createElement('li')
        this.buttonList.appendChild(li)
        li.appendChild(this.cancel)
    }

    setYesNoCancel() {
        this.ok.textContent = "Ja"

        this.no = document.createElement('div')
        this.no.setAttribute("tabindex", "0")
        this.no.classList.add("dialogButton")
        this.no.textContent = "Nein"
        this.no.onclick = () => this.endDialog(DialogResult.No)
        this.no.onkeyup = evt => {
            if (evt.which == 32)
                this.endDialog(DialogResult.No)
        }

        let li = document.createElement('li')
        this.buttonList.appendChild(li)
        li.appendChild(this.no)

        this.cancel = document.createElement('div')
        this.cancel.setAttribute("tabindex", "0")
        this.cancel.classList.add("dialogButton")
        this.cancel.textContent = "Abbrechen"
        this.cancel.onclick = () => this.endDialog(DialogResult.Cancel)
        this.cancel.onkeyup = evt => {
            if (evt.which == 32)
                this.endDialog(DialogResult.Cancel)
        }

        li = document.createElement('li')
        this.buttonList.appendChild(li)
        li.appendChild(this.cancel)
    }

    setInput(text: string) {
        const p = document.createElement('p')
        this.input = document.createElement('input')
        p.appendChild(this.input)
        this.input.type = "text"
        this.input.value = text
        this.input.select()
        this.dialog.classList.add("input")
        this.dialog.insertBefore(p, this.dialog.lastChild)
    }

    setCheckBox(text: string) {
        const p = document.createElement('p')
        const label = document.createElement('label')
        p.appendChild(label)
        this.checkBox = document.createElement('input')
        this.checkBox.type = "checkbox"
        label.appendChild(this.checkBox)
        const textNode = document.createTextNode(text)
        label.appendChild(textNode)
               
        this.dialog.classList.add("checkbox")
        this.dialog.insertBefore(p, this.dialog.lastChild)
    }

    addConflictView() {
        this.dialog.classList.add("conflictsDialog")
    //    conflicts = new ConflictView(this.dialog, operationCheckResult)
    }

    async show() {
        return new Promise<DialogResult>((resolve, reject) => {
            this.resolveDialogResult = resolve
            this.focusableElements.push(this.ok)
            if (this.input)
                this.focusableElements.push(this.input)
            if (this.checkBox)
                this.focusableElements.push(this.checkBox)
            if (this.no)
                this.focusableElements.push(this.no)
            if (this.cancel)
                this.focusableElements.push(this.cancel)

            document.body.appendChild(this.dialog)
            if (this.input)
                this.input.focus()
            else
                this.ok.focus()

            // if (conflicts) {
            //     conflicts.initialize()
            //     if (conflicts.notToOverride())
            //         this.no.focus()
            // }

            setTimeout(() => {
                if (this.shader)
                this.shader.classList.add('shaderVisible')
            }, 20)
        })
    }

    close() {
         if (this.input)
             this.textInput = this.input.value
        if (this.checkBox) 
            this.isChecked = this.checkBox.checked

        document.removeEventListener('keydown', this.keydown, true)

        if (this.shader) {

            const endAni = () => {
                this.shader.removeEventListener("webkitTransitionEnd", endAni, false)
                this.shader.remove()
            }

            this.shader.classList.remove('shaderVisible')
            this.shader.addEventListener("webkitTransitionEnd", endAni, false)
        }

        if (this.dialog)
            this.dialog.remove()
        if (this.activeElement)
            this.activeElement.focus()
    }

    private keydown = (evt: KeyboardEvent) => {
        if ((document.activeElement == this.input || document.activeElement == this.checkBox) && evt.which != 9 && evt.which != 27) {
            if (evt.which == 13) 
                this.endDialog(DialogResult.OK)
            return
        }

        switch (evt.which) {
            case 9: // TAB
                if (this.focusableElements.length > 1) {
                    var indexToFocus = 0

                    this.focusableElements.forEach((item, index) => {
                        if (item == document.activeElement) {
                            if (evt.shiftKey) {
                                indexToFocus = index - 1
                                if (indexToFocus == -1)
                                    indexToFocus = this.focusableElements.length - 1
                            } else {
                                indexToFocus = index + 1;
                                if (indexToFocus == this.focusableElements.length)
                                    indexToFocus = 0
                            }
                        }
                    })
                    this.focusableElements[indexToFocus].focus()
                }
                break
            case 13: // Enter
                if (this.ok == document.activeElement) 
                    this.endDialog(DialogResult.OK)
                else if (this.cancel == document.activeElement) 
                    this.endDialog(DialogResult.Cancel)
                else if (this.no == document.activeElement)
                    this.endDialog(DialogResult.No)
                break
            case 27: // ESC
                this.endDialog(DialogResult.Cancel)
                break
            case 32: // Leer
                if (this.ok == document.activeElement || this.no == document.activeElement || this.cancel == document.activeElement) {
                    document.activeElement.classList.add("buttonActive")
                    return
                }
                break
            case 37: // <-
                {
                    let focused = false
                    this.focusableElements.forEach((item, index) => {
                        if (item == document.activeElement) {
                            var indexToFocus = index - 1
                            if (!focused && indexToFocus >= 0) {
                                this.focusableElements[indexToFocus].focus()
                                focused = true
                            }
                        }
                    })
                }
                break
            case 39: // ->
                {
                    let focused = false
                    this.focusableElements.forEach((item, index) => {
                        if (item == document.activeElement) {
                            var indexToFocus = index + 1
                            if (!focused && indexToFocus < this.focusableElements.length) {
                                this.focusableElements[indexToFocus].focus()
                                focused = true
                            }
                                
                        }
                    })
                }
                break
        }
        // if (conflicts && conflicts.isTableView(evt.target))
        //     return
        evt.preventDefault()
        evt.stopPropagation()
    }


    private endDialog(dialogResult: DialogResult) {
        this.close()
        this.resolveDialogResult(dialogResult)
    }

    private readonly shader = document.createElement('div')
    private readonly dialog = document.createElement('div')
    private readonly activeElement: HTMLElement = document.activeElement as HTMLLIElement
    private readonly focusableElements: HTMLElement[] = []
    private readonly buttonList = document.createElement('ul')
    private readonly ok = document.createElement('div')
    private cancel: HTMLElement | undefined
    private no: HTMLElement | undefined

    private input: HTMLInputElement | undefined
    private checkBox: HTMLInputElement | undefined

    /// <var name="conflicts" type="ConflictView">Die Liste der Konflikte beim Verschieben und Kopieren</var>
    //var conflicts

    private resolveDialogResult: (result: DialogResult)=>void = res => {}
}

