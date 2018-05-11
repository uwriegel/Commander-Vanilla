#include <nan.h>
#include <string>
#include <windows.h>
#include "IconExtractor.h"
#include "Worker.h"
#include "utf8.h"
using namespace std;
using namespace v8;
using namespace Nan;

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

//info.GetReturnValue().Set(Nan::New<String>(u8.c_str()).ToLocalChecked());

NAN_MODULE_INIT(init) {
	Nan::Set(target, New<String>("getIcon").ToLocalChecked(), GetFunction(New<FunctionTemplate>(getIcon)).ToLocalChecked());
}

NODE_MODULE(addon, init)