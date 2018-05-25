#include <Windows.h>
#include "Helpers.h"
using namespace std;

unsigned long long ConvertWindowsTimeToUnixTime(const FILETIME& ft) {
	ULARGE_INTEGER ull;
	ull.LowPart = ft.dwLowDateTime;
	ull.HighPart = ft.dwHighDateTime;
	return (ull.QuadPart / 10000000ULL - 11644473600ULL) * 1000;
}
