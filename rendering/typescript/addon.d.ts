interface FileItem {
    name: string
	isDirectory: boolean
	isHidden: boolean
	size: number
	time: Date
}

interface DriveInfo {
	name: string
	label: string
	size: number
	type: number
	isReady: boolean
}



declare module 'addon' {
    function getIcon(extension: string, callback: (error: any, result: Buffer) => void): void
    function readDirectory(path: string, callback: (error: any, result: FileItem[]) => void): void
	function getDrives(callback: (error: any, result: DriveInfo[]) => void): void
}

