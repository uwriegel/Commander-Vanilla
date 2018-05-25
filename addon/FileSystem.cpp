#include <Windows.h>
#include <string>
#include <sstream>
#include <vector>
#include "FileSystem.h"
#include "Helpers.h"
#include "utf8.h"
using namespace std;

using GetFileVersionInfoFunction = BOOL(__stdcall*)(const wchar_t* filename, DWORD nill, DWORD length, void* data);
using VerQueryValueFunction = BOOL(__stdcall*)(void* block, const wchar_t* sub_block, void** buffer, UINT* length);

GetFileVersionInfoFunction CreateGetFileVersionInfo() {
	auto module = LoadLibraryW(L"Api-ms-win-core-version-l1-1-0.dll");
	return reinterpret_cast<GetFileVersionInfoFunction>(GetProcAddress(module, "GetFileVersionInfoW"));
}

VerQueryValueFunction CreateVerQueryValue() {
	auto module = LoadLibraryW(L"Api-ms-win-core-version-l1-1-0.dll");
	return reinterpret_cast<VerQueryValueFunction>(GetProcAddress(module, "VerQueryValueW"));
}

static GetFileVersionInfoFunction GetRawFileVersion{ CreateGetFileVersionInfo() };
static VerQueryValueFunction VerRawQueryValue{ CreateVerQueryValue() };

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
				ConvertWindowsTimeToUnixTime(w32fd.ftLastWriteTime)
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

void GetFileVersion(const wstring& path, string& info) {
	char buffer[1000];
	if (!GetRawFileVersion(path.c_str(), 0, sizeof(buffer), buffer)) 
		return; 

	VS_FIXEDFILEINFO *fixedFileInfo{ nullptr };
	uint32_t len{ 0 };
	VerRawQueryValue(buffer, L"\\", reinterpret_cast<void**>(&fixedFileInfo), &len);

	int file_major = HIWORD(fixedFileInfo->dwFileVersionMS);
	int file_minor = LOWORD(fixedFileInfo->dwFileVersionMS);
	int file_build = HIWORD(fixedFileInfo->dwFileVersionLS);
	int file_private = LOWORD(fixedFileInfo->dwFileVersionLS);

	stringstream result;
	result << file_major << "." << file_minor << "." << file_private << "." << file_build;
	info = move(result.str());
}

