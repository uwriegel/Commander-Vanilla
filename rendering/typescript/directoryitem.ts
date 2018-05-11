import { Item } from './Item'

export interface DirectoryItem extends Item {
    dateTime: Date
    exifDateTime?: string
    updated?: string
    fileSize: number
    version?: string
}

export interface UpdateItem {
    index: number
    version: string
    dateTime: string
}

export interface Update {
    id: number
    index: number
    updateItems: UpdateItem[]
}
