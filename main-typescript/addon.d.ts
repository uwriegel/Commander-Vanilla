declare module 'addon' {
    function getIcon(extension: string, callback: (error: any, result: Buffer) => void): void
    function hello(test: String):string
}

