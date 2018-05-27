interface Item {
    name: string
    isHidden?: boolean
    isDirectory: boolean
    isSelected: boolean
}

interface DirectoryItem extends Item {
    dateTime: Date
    exifDateTime?: Date | null
    updated?: string
    fileSize: number
    version?: string
}

interface RootItem extends Item {
    label: string
    fileSize: number
    type: DriveType
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
