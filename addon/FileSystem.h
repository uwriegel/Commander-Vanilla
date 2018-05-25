#pragma once
using namespace std;

struct FileItem {
	string name;
	bool isDirectory;
	bool isHidden;
	uint64_t size;
	uint64_t time;
};

struct DriveInfo {
	string Name;
	string VolumeLabel;
	ULARGE_INTEGER TotalSize;
	int Type;
	bool IsReady;
};

extern void GetFileItems(const wstring& directory, vector<FileItem>& results);
extern void GetDriveInfo(vector<DriveInfo>& results);
extern void GetFileVersion(const wstring& path, string& info);
