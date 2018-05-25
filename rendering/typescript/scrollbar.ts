/**
 * Scrollbar, used by TableView
 *
 * The scrollable content is overlayed by scrollbar on the right side. Scrollable content has to be positioned absolute
 * The complete control has to be positioned in a wrapper with 'Position' set to 'relative'
 */
class Scrollbar {
    /**
     * Constructs an instace of Scrollbar
     * 
     * @see Scrollbar
     * @param completeControl Div containing the element to scroll
     * @param positionChanged Callback, called to scroll
     */
    constructor(private readonly completeControl: HTMLElement, private readonly positionChanged: (position: number) => void) {

        this.timer = setTimeout(() => {}, -1)
        clearTimeout(this.timer)
        this.interval = setTimeout(() => {}, -1)
        clearTimeout(this.interval)

        this.scrollbar.classList.add("scrollbar")
        this.scrollbar.classList.add("scrollbarHidden")

        const up = document.createElement("div")
        up.classList.add("scrollbarUp")
        this.scrollbar.appendChild(up)

        const upImg = document.createElement("div")
        upImg.classList.add("scrollbarUpImg")
        up.appendChild(upImg)

        const down = document.createElement("div")
        down.classList.add("scrollbarDown")
        this.scrollbar.appendChild(down)

        const downImg = document.createElement("div")
        downImg.classList.add("scrollbarDownImg")
        down.appendChild(downImg)

        this.grip.classList.add("scrollbarGrip")
        this.scrollbar.appendChild(this.grip)

        completeControl.appendChild(this.scrollbar)

        up.onmousedown = () => {
            clearTimeout(this.timer)
            clearInterval(this.interval)
            this.mouseUp()

            this.timer = setTimeout(() => this.interval = setInterval(() => this.mouseUp(), 10), 600)
        }

        down.onmousedown = () => {
            clearTimeout(this.timer)
            clearInterval(this.interval)
            this.mouseDown()

            this.timer = setTimeout(() => this.interval = setInterval(() => this.mouseDown(), 10), 600)
        }

        this.scrollbar.onmousedown = evt => {
            if (!(<HTMLElement>evt.target).classList.contains("scrollbar"))
                return

            this.pageMousePosition = evt.pageY
            const isPageUp = evt.pageY < this.grip.offsetTop

            clearTimeout(this.timer)
            clearInterval(this.interval)
            if (isPageUp)
                this.pageUp()
            else
                this.pageDown()

            this.timer = setTimeout(() => this.interval = setInterval((
                isPageUp ? () => this.pageUp() : () => this.pageDown()), 10), 600)
        }

        this.grip.onmousedown = evt => {
            if (evt.which != 1)
                return
            this.gripping = true
            evt.preventDefault()

            this.gripTopDelta = this.grip.offsetTop + this.scrollbar.offsetTop - evt.pageY

            var gripperMove = (evt: MouseEvent) => {
                if (!this.gripping || evt.which != 1) {
                    window.removeEventListener('mousemove', gripperMove)
                    return
                }

                var top = evt.pageY + this.gripTopDelta - this.scrollbar.offsetTop
                if (top < 15)
                    top = 15
                else if (top + this.grip.offsetHeight - 15 > (this.parentHeight - 32))
                    top = this.parentHeight - 32 - this.grip.offsetHeight + 15
                this.grip.style.top = top + 'px'

                var currentPosition = Math.floor((top - 15) / this.step + 0.5)
                if (currentPosition != this.position) {
                    this.position = currentPosition
                    positionChanged(this.position)
                }
            }

            window.addEventListener('mousemove', gripperMove)
        }

        up.onmouseup = () => this.mouseup()
        down.onmouseup = () => this.mouseup()
        this.grip.onmouseup = () => this.mouseup()
        this.scrollbar.onmouseup = () => this.mouseup()

        this.scrollbar.onclick = evt => evt.stopPropagation()

        this.scrollbar.onmouseleave = () => {
            clearTimeout(this.timer)
            clearInterval(this.interval)
        }
    }

    initialize(setFocusToSet: () => void) {
        this.setFocus = setFocusToSet
    }

    /**
     * Has to be called when scrollableContent has changed item count
     * @param numberOfItems new complete number of items
     * @param numberOfItemsDisplayed number of Items which can be displayed without scrolling
     * @param newStartIndex first item displayed
     */
    itemsChanged(numberOfItems: number, numberOfItemsDisplayed: number, newStartIndex?: number) {
        this.parentHeight = this.completeControl.offsetHeight - this.offsetTop
        if (numberOfItems)
            this.itemsCountAbsolute = numberOfItems
        if (numberOfItemsDisplayed)
            this.itemsCountVisible = numberOfItemsDisplayed

        if (!this.itemsCountAbsolute)
            return

        if (this.itemsCountAbsolute <= this.itemsCountVisible)
            this.scrollbar.classList.add("scrollbarHidden")
        else {
            this.scrollbar.classList.remove("scrollbarHidden")
            var gripHeight = (this.parentHeight - 32) * (this.itemsCountVisible / this.itemsCountAbsolute)
            if (gripHeight < 5)
                gripHeight = 5
            this.steps = this.itemsCountAbsolute - this.itemsCountVisible
            this.step = (this.parentHeight - 32 - gripHeight) / this.steps
            this.grip.style.height = gripHeight + 'px'
            if (this.position > this.steps)
                this.position = this.steps
        }
        if (newStartIndex != undefined)
            this.position = newStartIndex
        this.positionGrip()
    }

    /**
     * Sets the scroll
     * @param position
     */
    setPosition(position: number) {
        this.position = position
        if (this.position > this.steps)
            this.position = this.steps
        if (this.position < 0)
            this.position = 0
        this.positionGrip()
    }

    private mouseup() {
        clearTimeout(this.timer)
        clearInterval(this.interval)
        this.gripping = false
        this.setFocus()
    }

    private mouseUp() {
        this.position -= 1
        if (this.position < 0) {
            this.position = 0
            clearTimeout(this.timer)
            clearInterval(this.interval)
            return
        }

        this.positionGrip()
        this.positionChanged(this.position)
    }

    private mouseDown() {
        this.position += 1
        if (this.position > this.steps) {
            this.position = this.steps
            clearTimeout(this.timer)
            clearInterval(this.interval)
            return
        }
        this.positionGrip()
        this.positionChanged(this.position)
    }

    private pageUp() {
        if (this.grip.offsetTop < this.pageMousePosition) {
            clearTimeout(this.timer)
            clearInterval(this.interval)
            return
        }

        this.position -= this.itemsCountVisible - 1
        if (this.position < 0) {
            const lastTime = this.position != 0
            this.position = 0
            clearTimeout(this.timer)
            clearInterval(this.interval)
            if (lastTime) {
                this.positionGrip()
                this.positionChanged(this.position)
            }
            return
        }
        this.positionGrip()
        this.positionChanged(this.position)
    }

    private pageDown() {
        if (this.grip.offsetTop + this.grip.offsetHeight > this.pageMousePosition) {
            clearTimeout(this.timer)
            clearInterval(this.interval)
            return
        }

        this.position += this.itemsCountVisible - 1
        if (this.position > this.steps) {
            const lastTime = this.position != 0
            this.position = this.steps
            clearTimeout(this.timer)
            clearInterval(this.interval)
            if (lastTime) {
                this.positionGrip()
                this.positionChanged(this.position)
            }
            return
        }

        this.positionGrip()
        this.positionChanged(this.position)
    }

    private positionGrip() {
        const top = 15 + this.position * this.step
        this.grip.style.top = top + 'px'
    }

    /**
     * The div element of the scrollbar
     */
    private readonly scrollbar = document.createElement("div")
    private readonly grip = document.createElement("div")
    private position = 0
    private setFocus = () => { }
    private gripTopDelta = -1
    private gripping = false
    private parentHeight = 0
    private offsetTop = 0

    /**
     * Ein einmaliges Timeout-Intervall
     */
    private timer: NodeJS.Timer
    /**
     * Ein zyklischer Timer
     */
    private interval: NodeJS.Timer
    private pageMousePosition = 0
    private step = 0
    private steps = 0
    private itemsCountAbsolute = 0
    private itemsCountVisible = 0
}




