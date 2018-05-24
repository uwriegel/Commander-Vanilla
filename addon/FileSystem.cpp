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
		if (wcscmp(w32fd.cFileName, L"..") != 0) {
			FileItem item{
				Utf8Encode(w32fd.cFileName),
				(w32fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY,
				(w32fd.dwFileAttributes & FILE_ATTRIBUTE_HIDDEN) == FILE_ATTRIBUTE_HIDDEN,
				static_cast<uint64_t>(w32fd.nFileSizeHigh) << 32 | w32fd.nFileSizeLow,
				convertWindowsTimeToUnixTime(w32fd.ftLastWriteTime)
			};
			results.push_back(item);
		}
	}
}

void GetDriveInfo(vector<DriveInfo>& results) {
	wchar_t buffer[1000];
	auto result = GetLogicalDriveStringsW(sizeof(buffer) / 2, buffer);
	auto count = result / 4;
	for (unsigned i = 0; i < count; i++)
	{
		DriveInfo di;
		auto name = buffer + i * 4;
		di.Name = Utf8Encode(name);

		WIN32_FILE_ATTRIBUTE_DATA data{ 0 };
		GetFileAttributesExW(name, GetFileExInfoStandard, &data);
		di.IsReady = data.dwFileAttributes != 0;
		if (di.IsReady)
		{
			wchar_t text[50];
			GetVolumeInformationW(name, text, sizeof(text) / 2, nullptr, nullptr, nullptr, nullptr, 0);
			di.VolumeLabel = Utf8Encode(text);
			di.Type = GetDriveTypeW(name);

			ULARGE_INTEGER nil{ 0 };
			GetDiskFreeSpaceExW(name, &nil, &di.TotalSize, &nil);
			results.push_back(di);
		}
	}
}