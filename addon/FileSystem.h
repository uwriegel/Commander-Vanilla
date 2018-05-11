#pragma once
using namespace std;
struct FileItem {
	string name;
	bool isDirectory;
	bool isHidden;
	uint64_t size;
	uint64_t time;
};

extern void GetFileItems(const wstring& directory, vector<FileItem>& results);