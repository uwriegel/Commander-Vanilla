#include <nan.h>
#include <string>
#include <windows.h>
#include "IconExtractor.h"
#include "Worker.h"
using namespace std;
using namespace v8;
using namespace Nan;

wstring Utf8Decode(const string &str)
{
	if (str.empty()) 
		return wstring();
	auto size_needed = MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), NULL, 0);
	wstring wstrTo(size_needed, 0);
	MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), &wstrTo[0], size_needed);
	return move(wstrTo);
}

string Utf8Encode(const std::wstring &wstr)
{
	if (wstr.empty()) 
		return string();
	auto size_needed = WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), NULL, 0, NULL, NULL);
	string strTo(size_needed, 0);
	WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), &strTo[0], size_needed, NULL, NULL);
	return move(strTo);
}

void BufferDeleteCallback(char* unused, void* theVector) { delete reinterpret_cast<vector<char>*>(theVector); }

NAN_METHOD(getIcon) {
	Utf8String val(To<String>(info[0]).ToLocalChecked());
	auto extension = Utf8Decode(*val);

	auto callback = new Callback(info[1].As<Function>());
	auto icon = new vector<char>;
	AsyncQueueWorker(new Worker(callback, [extension, icon]()-> void {
		GdiPlusInitialize();
		ExtractIcon(extension, *icon);
		GdiPlusUninitialize();
	}, [icon](Nan::Callback* callback)-> void {
		// set up return arguments
		auto bytes = NewBuffer(icon->data(), icon->size(), BufferDeleteCallback, icon).ToLocalChecked();
		Local<Value> argv[] = { Nan::Null(), bytes };
		callback->Call(2, argv);
	}));
}

NAN_METHOD(Method) {

	MessageBoxA(0, "Nanni20", "3", MB_OK);

	Utf8String s(info[0]->ToString());
	string str(*s);
	MessageBoxA(0, *s, "3", MB_OK);
	MessageBoxA(0, str.c_str(), "4", MB_OK);
	MessageBoxW(0, L"wörld", L"4ü", MB_OK);
	MessageBoxA(0, str.c_str(), str.c_str(), MB_OK);

	auto ws = Utf8Decode(str);
	MessageBoxW(0, ws.c_str(), ws.c_str(), MB_OK);

	wchar_t buff[300] = L"wörld ßß Nann";
	wcscat(buff, ws.c_str());

	auto u8 = Utf8Encode(buff);
	MessageBoxW(0, ws.c_str(), ws.c_str(), MB_OK);
	MessageBoxW(0, buff, buff, MB_OK);

	info.GetReturnValue().Set(Nan::New<String>(u8.c_str()).ToLocalChecked());
}


NAN_MODULE_INIT(init) {
	Nan::Set(target, New<String>("hello").ToLocalChecked(), GetFunction(New<FunctionTemplate>(Method)).ToLocalChecked());
	Nan::Set(target, New<String>("getIcon").ToLocalChecked(), GetFunction(New<FunctionTemplate>(getIcon)).ToLocalChecked());
}

NODE_MODULE(addon, init)