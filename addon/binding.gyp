{
    "targets": [
        {
            "target_name": "addon",
            "sources": [
                "addon.cpp",
                "IconExtractor.cpp",
                "FileSystem.cpp",
                "MemoryStream.cpp",
                "Worker.cpp",
                "utf8.cpp",
                "Helpers.cpp",
                "ExifReader.cpp"                
            ],
            "include_dirs" : [
                "<!(node -e \"require('nan')\")"
            ],
            "cflags": ["-Wall", "-std=c++14"],
            'link_settings': {
                "libraries": [ "gdiplus.lib" ]
            }
        }
    ]
}