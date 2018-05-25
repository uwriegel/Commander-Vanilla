class Grid {
    static create(grip: HTMLElement, view1: HTMLElement, view2: HTMLElement, isVertical: boolean, onChanged: ()=>void) {
        grip.addEventListener("mousedown", evt => {
            if (evt.which != 1)
                return
    
            const size1 = isVertical ? view1.offsetHeight : view1.offsetWidth
            const size2 = isVertical ? view2.offsetHeight : view2.offsetWidth
            const initialPosition = isVertical ? evt.pageY : evt.pageX
            const onmousemove = (evt: MouseEvent) => {
                let delta = (isVertical ? evt.pageY : evt.pageX) - initialPosition
                if (delta < 10 - size1)
                    delta = 10 - size1
                if (delta > (isVertical ? document.body.offsetHeight : document.body.offsetWidth) - 10 - size1)
                    delta = (isVertical ? document.body.offsetHeight : document.body.offsetWidth) - 10 - size1
    
                const newSize1 = size1 + delta
                const newSize2 = size2 - delta
                const procent1 = isVertical ? newSize1 : newSize1 / (newSize1 + newSize2 + grip.offsetWidth) * 100
                view1.style.flex = `0 0 ${procent1}${(isVertical ? "px" : "%")}`
                view2.style.flexGrow = `1`
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
}

