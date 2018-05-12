
export function createGrid(grip: HTMLElement, view1: HTMLElement, view2: HTMLElement, isVertical: boolean, onChanged: ()=>void) {
    grip.addEventListener("mousedown", evt => {
        if (evt.which != 1)
            return

        const size1 = isVertical ? view1.offsetHeight : view1.offsetWidth
        const size2 = isVertical ? view2.offsetHeight : view2.offsetWidth
        const initialPosition = isVertical ? evt.pageY : evt.pageX
        const onmousemove = (evt: MouseEvent) => {
            const delta = (isVertical ? evt.pageY : evt.pageX) - initialPosition
            const newSize1 = size1 + delta
            const newSize2 = size2 - delta
            const factor = newSize1 / newSize2
            view1.style.flexGrow = `${factor}`
            console.log(factor)
            view2.style.flexGrow = "1"
            onChanged()

            evt.stopPropagation()
            evt.preventDefault()
        }

        const onmouseup = (evt: MouseEvent) => {
            window.removeEventListener('mousemove', onmousemove, true)
            window.removeEventListener('mouseup', onmouseup, true)
            evt.stopPropagation();
            evt.preventDefault();
        }

        window.addEventListener('mousemove', onmousemove, true)
        window.addEventListener('mouseup', onmouseup, true)

        evt.stopPropagation()
        evt.preventDefault()
    }, true)
}
