let startPosition = 0

const list = document.getElementById("list") as HTMLUListElement

const itemHeight = initializeItemHeight()
console.log(itemHeight)

const capacity = calculateCapacity()

const itemsCount = 30

const lis = [...Array(Math.min(capacity + 1, itemsCount)).keys()].map(n => {
    const li = document.createElement("li")
    li.innerText = `Eintrag #${n}`
    return li
})

lis.forEach(n => list.appendChild(n))

const completeControl = document.getElementById('completeControl')!
const scrollbar = new Scrollbar(completeControl, () => { })

scrollbar.itemsChanged(itemsCount, capacity)

startResizeChecking()

function initializeItemHeight() {
    const div = document.createElement("div")
    document.body.appendChild(div)

    const max = 50
    for (let i = 0; i < max; i++) {
        const li = document.createElement("li")
        li.innerText = `Eintrag #${1}`
        div.appendChild(li)
    }
    const rowHeight = div.clientHeight / max
    document.body.removeChild(div)
    return rowHeight
}

function startResizeChecking() {
    let recentHeight = list.clientHeight

    window.addEventListener('resize', () => resizeChecking())
    let capacity = calculateCapacity()

    function resizeChecking() {
        console.log(list.clientHeight)
        if (list.clientHeight != recentHeight) {
            recentHeight = list.clientHeight
            let recentCapacity = capacity
            capacity = calculateCapacity()
            scrollbar.itemsChanged(itemsCount, capacity)

            const itemsCountOld = Math.min(recentCapacity + 1, itemsCount - startPosition)
            const itemsCountNew = Math.min(capacity + 1, itemsCount - startPosition)
            if (itemsCountNew < itemsCountOld) {
                for (let i = itemsCountOld - 1; i >= itemsCountNew; i--)
                    list.children[i].remove()
            }
            else {
                for (let i = itemsCountOld; i < itemsCountNew; i++) {
                    const li = document.createElement("li")
                    li.innerText = `Eintrag #${i + startPosition}`
                    list.appendChild(li);
                }
            }
        }
    }
}

function calculateCapacity() {
    let capacity = Math.floor(list.offsetHeight / itemHeight)
    if (capacity < 0)
        capacity = 0

    console.log(`Kapazität: ${capacity}`)
    return capacity
}
