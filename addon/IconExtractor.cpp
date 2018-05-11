#include <Windows.h>
#include <Gdiplus.h>
#include <memory>
#include <vector>
#include <string>
#include "iconextractor.h"
#include "memorystream.h"
using namespace std;
using namespace Gdiplus;

struct BitmapAndPixels
{
	BitmapAndPixels(int number_of_bits) : pixels(number_of_bits) {}
	unique_ptr<Bitmap> bmp;
	vector<int> pixels;
};

CLSID png_clsid{ 0 };
ULONG_PTR gdiplus_token{ 0 };

CLSID GetEncoderClsid(const wstring& format);
BitmapAndPixels CreateAlphaChannelBitmapFromIcon(HICON hIcon);

void GdiPlusInitialize()
{
	GdiplusStartupInput gdiplus_startup_input;
	gdiplus_token;
	auto status = GdiplusStartup(&gdiplus_token, &gdiplus_startup_input, nullptr);

	if (png_clsid.Data1 == 0)
		png_clsid = GetEncoderClsid(L"image/png"s);
}

void GdiPlusUninitialize() { GdiplusShutdown(gdiplus_token); }

void ExtractIcon(const wstring& icon_path, vector<char>& bytes) {
	SHFILEINFOW file_info{ 0 };
	SHGetFileInfoW(icon_path.c_str(), FILE_ATTRIBUTE_NORMAL, &file_info, sizeof(file_info),
		SHGFI_ICON | SHGFI_SMALLICON | SHGFI_USEFILEATTRIBUTES | SHGFI_TYPENAME);
	if (file_info.hIcon == nullptr) {
		for (auto i = 0; i < 3; i++) {
			SHGetFileInfoW(icon_path.c_str(), FILE_ATTRIBUTE_NORMAL, &file_info, sizeof(file_info),
				SHGFI_ICON | SHGFI_SMALLICON | SHGFI_USEFILEATTRIBUTES | SHGFI_TYPENAME);
			Sleep(20);
			if (file_info.hIcon != nullptr)
				break;
		}
	}
	auto result = CreateAlphaChannelBitmapFromIcon(file_info.hIcon);
	MemoryStream ms(bytes);
	result.bmp->Save(&ms, &png_clsid);

	DestroyIcon(file_info.hIcon);
}

CLSID GetEncoderClsid(const wstring& format)
{
	UINT num{ 0 };
	UINT  size{ 0 };
	GetImageEncodersSize(&num, &size);
	if (size == 0)
		return { 0 };

	vector<char> image_codec_info_buffer(size);
	auto image_codec_info = reinterpret_cast<ImageCodecInfo*>(image_codec_info_buffer.data());
	GetImageEncoders(num, size, image_codec_info);
	for (auto i = 0u; i < num; ++i)
		if (format == image_codec_info[i].MimeType)
			return image_codec_info[i].Clsid;
	return { 0 };
}

BitmapAndPixels CreateAlphaChannelBitmapFromIcon(HICON icon)
{
	ICONINFO icon_info{ 0 };
	GetIconInfo(icon, &icon_info);

	auto dc = GetDC(nullptr);

	BITMAP bm{ 0 };
	GetObject(icon_info.hbmColor, sizeof(bm), &bm);

	BITMAPINFO bmi{ 0 };
	bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
	bmi.bmiHeader.biWidth = bm.bmWidth;
	bmi.bmiHeader.biHeight = -bm.bmHeight;
	bmi.bmiHeader.biPlanes = 1;
	bmi.bmiHeader.biBitCount = 32;
	bmi.bmiHeader.biCompression = BI_RGB;

	int number_of_bits = bm.bmWidth * bm.bmHeight;

	BitmapAndPixels result(number_of_bits);
	GetDIBits(dc, icon_info.hbmColor, 0, bm.bmHeight, result.pixels.data(), &bmi, DIB_RGB_COLORS);

	// Check whether the color bitmap has an alpha channel.
	// (On my Windows 7, all file icons I tried have an alpha channel.)
	auto has_alpha{ false };
	for (int i = 0; i < number_of_bits; i++)
		if ((result.pixels[i] & 0xff000000) != 0) {
			has_alpha = TRUE;
			break;
		}

	// If no alpha values available, apply the mask bitmap
	if (!has_alpha)
	{
		// Extract the mask bitmap
		vector<int> mask_bits(number_of_bits);
		GetDIBits(dc, icon_info.hbmMask, 0, bm.bmHeight, mask_bits.data(), &bmi, DIB_RGB_COLORS);
		// Copy the mask alphas into the color bits
		for (int i = 0; i < number_of_bits; i++)
			if (mask_bits[i] == 0)
				result.pixels[i] |= 0xff000000;
	}

	ReleaseDC(nullptr, dc);
	DeleteObject(icon_info.hbmColor);
	DeleteObject(icon_info.hbmMask);

	// Create GDI+ Bitmap
	result.bmp = make_unique<Bitmap>(bm.bmWidth, bm.bmHeight, bm.bmWidth * 4, PixelFormat32bppARGB, reinterpret_cast<BYTE*>(result.pixels.data()));

	return result;
}