#include <nan.h>
#include <string>
#include <windows.h>
#include "IconExtractor.h"
#include "FileSystem.h"
#include "ExifReader.h"
#include "Worker.h"
#include "utf8.h"
using namespace std;
using namespace v8;
using namespace Nan;

NAN_METHOD(GetIcon) {
	Utf8String val(To<String>(info[0]).ToLocalChecked());
	auto extension = Utf8Decode(*val);

	auto callback = new Callback(info[1].As<Function>());
	auto icon = new vector<char>;
	AsyncQueueWorker(new Worker(callback, 
		[extension, icon]()-> void {
			GdiPlusInitialize();
			ExtractIcon(extension, *icon);
			GdiPlusUninitialize();
		}, [icon](Nan::Callback* callback)-> void {
			auto bytes = NewBuffer(icon->data(), icon->size(),
				[](char*, void* theVector) { delete reinterpret_cast<vector<char>*>(theVector); },
				icon).ToLocalChecked();
			Local<Value> argv[] = { Nan::Null(), bytes };
			Call(*callback, 2, argv).ToLocalChecked();
		}
	));
}

NAN_METHOD(ReadDirectory) {
	Utf8String val(To<String>(info[0]).ToLocalChecked());
	auto path = Utf8Decode(*val);

	auto callback = new Callback(info[1].As<Function>());
	auto items = new vector<FileItem>;
	AsyncQueueWorker(new Worker(callback, 
		[path, items]()-> void { GetFileItems(path, *items); }, 
		[items](Nan::Callback* callback)-> void {
			Local<Array> resultList = New<Array>(items->size());
			int i {0};
			for (auto item : *items) {
				Local<Object> result = New<Object>();

				result->Set(New<String>("name").ToLocalChecked(), 
					New<String>(item.name.c_str()).ToLocalChecked());
				result->Set(New<String>("size").ToLocalChecked(), New<Number>(static_cast<double>(item.size)));
				result->Set(New<String>("time").ToLocalChecked(),
					New<Date>(static_cast<double>(item.time)).ToLocalChecked());
				result->Set(New<String>("isDirectory").ToLocalChecked(), New<Boolean>(item.isDirectory));
				result->Set(New<String>("isHidden").ToLocalChecked(), New<Boolean>(item.isHidden));
				resultList->Set(i++, result);
			}

			Local<Value> argv[] = { Nan::Null(), resultList };
			delete items;
			Call(*callback, 2, argv).ToLocalChecked();
		}
	));
}

NAN_METHOD(GetDrives) {
	auto callback = new Callback(info[0].As<Function>());
	auto driveInfos = new vector<DriveInfo>;
	AsyncQueueWorker(new Worker(callback,
		[driveInfos]()-> void { GetDriveInfo(*driveInfos); },
	 	[driveInfos](Nan::Callback* callback)-> void {
	 		Local<Array> resultList = New<Array>(driveInfos->size());
	 		int i{ 0 };
	 		for (auto driveInfo : *driveInfos) {
	 			Local<Object> result = New<Object>();

				result->Set(New<String>("name").ToLocalChecked(),
					New<String>(driveInfo.Name).ToLocalChecked());
				result->Set(New<String>("label").ToLocalChecked(),
					New<String>(driveInfo.VolumeLabel).ToLocalChecked());
				result->Set(New<String>("size").ToLocalChecked(), New<Number>(static_cast<double>(driveInfo.TotalSize.QuadPart)));
				result->Set(New<String>("type").ToLocalChecked(), New<Number>(driveInfo.Type));
				result->Set(New<String>("isReady").ToLocalChecked(), New<Boolean>(driveInfo.IsReady));
	 			resultList->Set(i++, result);
			}		

			Local<Value> argv[] = { Nan::Null(), resultList };
			delete driveInfos;
			Call(*callback, 2, argv).ToLocalChecked();
	 	}
	));
}

NAN_METHOD(GetFileVersion) {
	Utf8String val(To<String>(info[0]).ToLocalChecked());
	auto path = Utf8Decode(*val);

	auto callback = new Callback(info[1].As<Function>());
	auto versionInfo = new string;
	AsyncQueueWorker(new Worker(callback,
		[path, versionInfo]()-> void { GetFileVersion(path, *versionInfo); },
		[versionInfo](Nan::Callback* callback)-> void {
			Local<Value> argv[] = { Nan::Null(), New<String>(versionInfo->c_str()).ToLocalChecked() };
			delete versionInfo;
			Call(*callback, 2, argv).ToLocalChecked();
		}
	));
}

NAN_METHOD(GetExifDate) {
	Utf8String val(To<String>(info[0]).ToLocalChecked());
	auto path = Utf8Decode(*val);

	auto callback = new Callback(info[1].As<Function>());
	auto time = new uint64_t;
	AsyncQueueWorker(new Worker(callback,
		[path, time]()-> void { *time = GetExifDate(path); },
		[time](Nan::Callback* callback)-> void {
		Local<Value> argv[] = { Nan::Null(), New<Date>(static_cast<double>(*time)).ToLocalChecked() };
		delete time;
		Call(*callback, 2, argv).ToLocalChecked();
	}
	));
}

//info.GetReturnValue().Set(Nan::);

NAN_MODULE_INIT(init) {
	Nan::Set(target, New<String>("getIcon").ToLocalChecked(), GetFunction(New<FunctionTemplate>(GetIcon)).ToLocalChecked());
	Nan::Set(target, New<String>("readDirectory").ToLocalChecked(), GetFunction(New<FunctionTemplate>(ReadDirectory)).ToLocalChecked());
	Nan::Set(target, New<String>("getDrives").ToLocalChecked(), GetFunction(New<FunctionTemplate>(GetDrives)).ToLocalChecked());
	Nan::Set(target, New<String>("getFileVersion").ToLocalChecked(), GetFunction(New<FunctionTemplate>(GetFileVersion)).ToLocalChecked());
	Nan::Set(target, New<String>("getExifDate").ToLocalChecked(), GetFunction(New<FunctionTemplate>(GetExifDate)).ToLocalChecked());
}

NODE_MODULE(addon, init)