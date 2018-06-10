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

interface ConflictItem extends Item {
    sourceFileSize: number
    targetFileSize: number
    sourceVersion?: string
    targetVersion?: string
    sourceDateTime: Date
    targetDateTime: Date
}