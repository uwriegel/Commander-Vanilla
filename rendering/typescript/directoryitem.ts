interface DirectoryItem extends Item {
    dateTime: Date
    exifDateTime?: string
    updated?: string
    fileSize: number
    version?: string
}

interface UpdateItem {
    index: number
    version: string
    dateTime: string
}

interface Update {
    id: number
    index: number
    updateItems: UpdateItem[]
}
