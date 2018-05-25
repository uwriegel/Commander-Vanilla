#pragma once
#include <Windows.h>
using namespace std;

extern unsigned long long ConvertWindowsTimeToUnixTime(const FILETIME& ft);
