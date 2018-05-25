class ItemsChooser {
    static get(items: BaseItems, path: string) : BaseItems | null {
        if (path == "root" && !(items instanceof DriveItems)) {
            return new DriveItems()
        }
        else if (!(items instanceof DirectoryItems))
            return new DirectoryItems(path)
        else
            return null
    }
}

