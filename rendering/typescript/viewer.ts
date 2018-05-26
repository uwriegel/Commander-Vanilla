class Viewer {
    get HtmlElement() { return this.viewer }
    
    get Hidden() { return this.viewer.classList.contains("hidden")}
    set Hidden(hidden: boolean) { 
        if (hidden) 
            this.viewer.classList.add("hidden") 
        else 
            this.viewer.classList.remove("hidden") 
    }

    selectionChanged(item?: string) {
        if (this.viewer.classList.contains("hidden")) {
            if (this.lastFile) {
                this.video.src = ""
                this.frame.src = ""
                this.img.src = ""
                this.lastFile = ""
            }
            return
        }
            
        if (this.lastFile == item)
            return
        this.lastFile = item;
        if (this.timer)
            clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            if (item) {
                let itemcheck = item.toLowerCase()
                if (itemcheck.endsWith(".mp4") || itemcheck.endsWith(".mkv") || itemcheck.endsWith(".mp3") || itemcheck.endsWith(".wav"))
                {
                    this.img.classList.add("hidden")
                    this.frame.classList.add("hidden")
                    this.frame.src = ""
                    this.video.classList.remove("hidden")
                    if (this.video.src != item)
                    this.video.src = item
                }
                else if (itemcheck.endsWith(".jpg") || itemcheck.endsWith(".png") || itemcheck.endsWith(".ico"))
                {
                    this.img.classList.remove("hidden")
                    this.img.src = item
                    this.frame.classList.add("hidden")
                    this.frame.src = ""
                    this.video.classList.add("hidden")
                    this.video.pause()
                }
                else if (itemcheck.endsWith(".pdf"))
                // else if (itemcheck.endsWith(".pdf") || itemcheck.endsWith("cs") || itemcheck.endsWith("html") || itemcheck.endsWith("xml")
                //     || itemcheck.endsWith("java") || itemcheck.endsWith("xaml") || itemcheck.endsWith("java")
                //     || itemcheck.endsWith("js") || itemcheck.endsWith("css"))
                {
                    this.img.classList.add("hidden")
                    this.video.classList.add("hidden")
                    this.video.pause()
                    this.frame.classList.remove("hidden")
                    this.frame.src = item
                }
                else
                {
                    this.img.classList.add("hidden")
                     this.video.classList.add("hidden")
                     this.video.pause()
                     this.frame.classList.add("hidden")
                     this.frame.src = ""
                }
            }
            else
            {
                this.img.classList.add("hidden")
                this.video.classList.add("hidden")
                this.video.pause()
                this.frame.classList.add("hidden")
                this.frame.src = ""
            }
        }, 50)
    }

    private readonly viewer = <HTMLElement>document.getElementById("viewer")
    private readonly img = <HTMLImageElement>document.getElementById("viewerImg")
    private readonly video = <HTMLVideoElement>document.getElementById("viewerVideo")
    private readonly frame = <HTMLIFrameElement>document.getElementById("viewerFrame")
    private lastFile? = ""
    private timer: NodeJS.Timer | null = null
}