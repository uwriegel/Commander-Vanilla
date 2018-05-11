interface FileItem {
    name: string
	isDirectory: boolean
	isHidden: boolean
	size: number
	time: Date
}

declare module 'addon' {
    function getIcon(extension: string, callback: (error: any, result: Buffer) => void): void
    function readDirectory(path: string, callback: (error: any, result: FileItem[]) => void): void
}

