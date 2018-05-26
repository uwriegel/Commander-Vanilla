#include <Windows.h>
#include <map>
#include <ctime>
#include <string>
#include "ExifReader.h"
#include "Helpers.h"
#include "utf8.h"
using namespace std;

const int DateTimeOriginal = 0x9003;
const int DateTime = 0x132;

class ExifReader {
public:
	ExifReader(const wstring& path) {
		file = CreateFileW(path.c_str(), GENERIC_READ, FILE_SHARE_READ, nullptr, OPEN_EXISTING, 0, nullptr);
		auto hasExifValue = Read2Bytes();
		if (hasExifValue == 0xFFD8)
		{
			if (!ReadToExifStart())
				return;
			if (!CreateTagIndex())
				return;
			hasExif = true;
		}
	}
	~ExifReader() {
		CloseHandle(file);
	}
	bool HasExif() {
		return hasExif;
	}
	char* GetTagString(uint16_t tagId) {
		auto tagType = GetTagType(tagId);
		if (!tagType)
			return nullptr;
		auto numberOfComponents = Read4Bytes();
		auto tagData = Read4Bytes();

		// If the total space taken up by the field is longer than the
		// 2 bytes afforded by the tagData, tagData will contain an offset
		// to the actual data.
		if (numberOfComponents > 4)
			return ReadString(tagData, numberOfComponents);
		else
			return ReadString(numberOfComponents);
	}
private:
	char ReadByte() {
		char buffer;
		DWORD read{ 0 };
		ReadFile(file, &buffer, 1, &read, nullptr);
		return buffer;
	}

	uint16_t Read2Bytes() {
		char buffer[2];
		DWORD read{ 0 };
		ReadFile(file, buffer, 2, &read, nullptr);
		uint16_t result{ 0 };
		if (isLittleEndian)
			result = *(uint16_t*)buffer;
		else {
			char bigEndianBuffer[2];
			bigEndianBuffer[0] = buffer[1];
			bigEndianBuffer[1] = buffer[0];
			result = *(uint16_t*)bigEndianBuffer;
		}

		return result;
	}

	uint32_t Read4Bytes() {
		char buffer[4];
		DWORD read{ 0 };
		ReadFile(file, buffer, 4, &read, nullptr);
		uint32_t result{ 0 };
		if (isLittleEndian)
			result = *(uint32_t*)buffer;
		else {
			char bigEndianBuffer[4];
			bigEndianBuffer[0] = buffer[3];
			bigEndianBuffer[1] = buffer[2];
			bigEndianBuffer[2] = buffer[1];
			bigEndianBuffer[3] = buffer[0];
			result = *(uint32_t*)bigEndianBuffer;
		}

		return result;
	}

	char *ReadString(int count) {
		char* buffer = new char[count];
		DWORD read{ 0 };
		ReadFile(file, buffer, count, &read, nullptr);
		return buffer;
	}

	char *ReadString(int offset, int count) {
		char* buffer = new char[count];
		DWORD read{ 0 };

		// Keep the current file offset
		auto originalOffset = SetFilePointer(file, 0, nullptr, FILE_CURRENT);
		// Move to the TIFF offset and retrieve the data
		SetFilePointer(file, offset + tiffHeaderStart, nullptr, FILE_BEGIN);

		ReadFile(file, buffer, count, &read, nullptr);
		// Restore the file offset
		SetFilePointer(file, originalOffset, nullptr, FILE_BEGIN);

		return buffer;
	}

	void CatalogueIFD() {
		// Assume we're just before the IFD.

		// First 2 bytes is the number of entries in this IFD
		auto entryCount = Read2Bytes();
		for (auto i = 0; i < entryCount; i++) {
			auto currentTagNumber = Read2Bytes();
			// Record this in the catalogue
			catalogue[currentTagNumber] = SetFilePointer(file, 0, nullptr, FILE_CURRENT) - 2;
			// Go to the end of this item (10 bytes, as each entry is 12 bytes long)
			SetFilePointer(file, 10, nullptr, FILE_CURRENT);
		}
	}

	uint16_t GetTagType(uint16_t tagId) {
		auto val = catalogue[tagId];
		if (val == 0)
			return 0;
		// Jump to the TIFF offset
		SetFilePointer(file, val, nullptr, FILE_BEGIN);
		// Read the tag number from the file
		auto currentTagID = Read2Bytes();
		if (currentTagID != tagId)
			// "Tag number not at expected offset"
			return 0;

		// Read the offset to the Exif IFD
		return Read2Bytes();
	}

	uint32_t GetTagInt(uint16_t tagId) {
		auto tagType = GetTagType(tagId);
		if (tagType == 0)
			return 0;
		auto numberOfComponents = Read4Bytes();
		return Read4Bytes();
	}

	bool CreateTagIndex() {
		// The next 4? bytes are the size of the Exif data.
		Read2Bytes();
		// Next is the Exif data itself. It starts with the ASCII "Exif" followed by 2 zero bytes.
		char* text = ReadString(4);
		if (strncmp(text, "Exif", 4) != 0) {
			// "Exif data not found"
			delete text;
			return false;
		}
		delete text;
		auto nil = Read2Bytes();
		if (nil != 0)
			// "Malformed Exif data"
			return false;
		// We're now into the TIFF format
		tiffHeaderStart = SetFilePointer(file, 0, nullptr, FILE_CURRENT);
		// What byte align will be used for the TIFF part of the document? II for Intel, MM for Motorola
		text = ReadString(2);
		isLittleEndian = strncmp(text, "II", 2) == 0;
		delete text;
		// Next 2 bytes are always the same.
		if (Read2Bytes() != 0x002A)
			// "Error in TIFF data"
			return false;
		// Get the offset to the IFD (image file directory)
		auto ifdOffset = Read4Bytes();
		// Note that this offset is from the first byte of the TIFF header. Jump to the IFD.
		SetFilePointer(file, tiffHeaderStart + ifdOffset, nullptr, FILE_BEGIN);
		// Catalogue this first IFD (there will be another IFD)
		CatalogueIFD();
		// There's more data stored in the subifd, the offset to which is found in tag 0x8769.
		// As with all TIFF offsets, it will be relative to the first byte of the TIFF header.
		auto offset = GetTagInt(0x8769);
		if (offset == 0)
			// "Unable to locate Exif data"
			return false;
		// Jump to the exif SubIFD
		SetFilePointer(file, tiffHeaderStart + offset, nullptr, FILE_BEGIN);
		// Add the subIFD to the catalogue too
		CatalogueIFD();

		// Go to the GPS IFD and catalogue that too. It's an optional section.
		offset = GetTagInt(0x8825);
		if (offset != 0) {
			// Jump to the GPS SubIFD
			SetFilePointer(file, tiffHeaderStart + offset, nullptr, FILE_BEGIN);
			// Add the subIFD to the catalogue too
			CatalogueIFD();
		}
		return true;
	}

	// Scans to the Exif block
	bool ReadToExifStart() {
		// The file has a number of blocks (Exif/JFIF), each of which
		// has a tag number followed by a length. We scan the document until the required tag (0xFFE1)
		// is found. All tags start with FF, so a non FF tag indicates an error.

		// Get the next tag.
		char markerStart = 0;
		char markerNumber = 0;

		while (true) {
			markerStart = ReadByte();
			markerNumber = ReadByte();
			if (markerStart != (char)0xFF || markerNumber == (char)0xE1)
				break;
			// Get the length of the data.
			auto dataLength = Read2Bytes();
			// Jump to the end of the data (note that the size field includes its own size)!
			SetFilePointer(file, dataLength - 2, nullptr, FILE_CURRENT);
		}
		// It's only success if we found the 0xFFE1 marker
		return markerStart == (char)0xFF && markerNumber == (char)0xE1;
		//throw new Exception("Could not find Exif data block");
	}

	HANDLE file{ INVALID_HANDLE_VALUE };
	bool hasExif{ false };
	bool isLittleEndian{ false };
	map<uint16_t, int> catalogue;
	DWORD tiffHeaderStart{ 0 };
};

uint64_t GetExifDate(const wstring& path) {
	ExifReader exif(path.c_str());
	if (!exif.HasExif())
		return 0;
	auto what = exif.GetTagString(DateTimeOriginal);
	if (!what) {
		what = exif.GetTagString(DateTime);
		if (!what)
			return 0;
	}
	what[4] = 0;
	auto year = atoi(what);
	auto part = what + 5;
	part[2] = 0;
	auto month = atoi(part);
	part = what + 8;
	part[2] = 0;
	auto day = atoi(part);
	part = what + 11;
	part[2] = 0;
	auto hour = atoi(part);
	part = what + 14;
	part[2] = 0;
	auto minute = atoi(part);
	part = what + 17;
	part[2] = 0;
	auto second = atoi(part);
	delete what;
	tm zeit{ 0 };
	zeit.tm_hour = hour;
	zeit.tm_min = minute;
	zeit.tm_sec = second;
	zeit.tm_year = year - 1900;
	zeit.tm_mon = month - 1;
	zeit.tm_mday = day;
	time_t zeit_t = mktime(&zeit);
	auto ltc = localtime(&zeit_t);
	zeit_t = mktime(ltc);
	return (long long)zeit_t * 1000;
}