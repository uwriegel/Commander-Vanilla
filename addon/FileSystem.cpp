#include <Windows.h>
#include <string>
#include <vector>
#include "FileSystem.h"
#include "utf8.h"
using namespace std;

uint64_t convertWindowsTimeToUnixTime(const FILETIME& ft) {
	ULARGE_INTEGER ull;
	ull.LowPart = ft.dwLowDateTime;
	ull.HighPart = ft.dwHighDateTime;
	return (ull.QuadPart / 10000000ULL - 11644473600ULL) * 1000;
}

void GetFileItems(const wstring& directory, vector<FileItem>& results) {
	auto searchString = directory + L"\\*.*"s;
	WIN32_FIND_DATAW w32fd{ 0 };
	auto ret = FindFirstFileW(searchString.c_str(), &w32fd);
	while (FindNextFileW(ret, &w32fd) == TRUE) {
		FileItem item {
			Utf8Encode(w32fd.cFileName),
			(w32fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY,
			(w32fd.dwFileAttributes & FILE_ATTRIBUTE_HIDDEN) == FILE_ATTRIBUTE_HIDDEN,
			static_cast<uint64_t>(w32fd.nFileSizeHigh) << 32 | w32fd.nFileSizeLow,
			convertWindowsTimeToUnixTime(w32fd.ftLastWriteTime)
		};
		if (item.name != ".."s)
			results.push_back(item);
	}
}