#include <windows.h>
#include <string>
#include "utf8.h"
using namespace std;

wstring Utf8Decode(const string &str)
{
	if (str.empty()) 
		return wstring();
	auto size_needed = MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), NULL, 0);
	wstring wstrTo(size_needed, 0);
	MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), &wstrTo[0], size_needed);
	return move(wstrTo);
}

string Utf8Encode(const wstring &wstr)
{
	if (wstr.empty()) 
		return string();
	auto size_needed = WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), NULL, 0, NULL, NULL);
	string strTo(size_needed, 0);
	WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), &strTo[0], size_needed, NULL, NULL);
	return move(strTo);
}
