#include <nan.h>
#include <string>
#include <windows.h>
#include "IconExtractor.h"
#include "FileSystem.h"
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
			Call(*callback, 2, argv).ToLocalChecked();
		}
	));
}


//info.GetReturnValue().Set(Nan::New<String>(u8.c_str()).ToLocalChecked());

NAN_MODULE_INIT(init) {
	Nan::Set(target, New<String>("getIcon").ToLocalChecked(), GetFunction(New<FunctionTemplate>(GetIcon)).ToLocalChecked());
	Nan::Set(target, New<String>("readDirectory").ToLocalChecked(), GetFunction(New<FunctionTemplate>(ReadDirectory)).ToLocalChecked());
}

NODE_MODULE(addon, init)