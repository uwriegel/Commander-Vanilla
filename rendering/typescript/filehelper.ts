class FileHelper {
    static getNameOnly(name: string): string {
        var pos = name.lastIndexOf('.');
        if (pos == -1)
            return name
        return name.substring(0, pos)
    }
    
    static getExtension(name: string): string {
        var pos = name.lastIndexOf('.')
        if (pos == -1)
            return ""
        return name.substring(pos)
    }
    
    static formatFileSize(fileSize: number): string {
        if (!fileSize)
            return ""
        var strNumber = `${fileSize}`
        var thSep = '.'
        if (strNumber.length > 3) {
            var begriff = strNumber
            strNumber = ""
            for (var j = 3; j < begriff.length; j += 3) {
                var extract = begriff.slice(begriff.length - j, begriff.length - j + 3)
                strNumber = thSep + extract + strNumber
            }
            var strfirst = begriff.substr(0, (begriff.length % 3 == 0) ? 3 : (begriff.length % 3))
            strNumber = strfirst + strNumber
        }
        return strNumber
    }
    
    static formatDate(date: Date): string {
        return FileHelper.dateFormat.format(date) + " " + FileHelper.timeFormat.format(date)
    }
    
    static compareVersion(versionLeft?: string, versionRight?: string): number {
        if (!versionLeft)
            return -1
        else if (!versionRight)
            return 1
        else {
            var leftParts = <number[]><any>versionLeft.split('.')
            var rightParts = <number[]><any>versionRight.split('.')
            if (leftParts[0] != rightParts[0])
                return <number>leftParts[0] - rightParts[0]
            else if (leftParts[1] != rightParts[1])
                return leftParts[1] - rightParts[1]
            else if (leftParts[2] != rightParts[2])
                return leftParts[2] - rightParts[2]
            else if (leftParts[3] != rightParts[3])
                return leftParts[3] - rightParts[3]
            else return -1
        }
    }
        
    private static readonly dateFormat = Intl.DateTimeFormat("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    
    private static readonly timeFormat = Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    })
}
