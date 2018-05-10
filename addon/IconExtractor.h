#pragma once
#include <vector>
using namespace std;

extern void GdiPlusInitialize();
extern void GdiPlusUninitialize();
extern void ExtractIcon(const wstring& icon_path, vector<char>& bytes);

