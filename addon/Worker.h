#pragma once
#include <nan.h>
#include <functional>
using namespace v8;
using namespace Nan;
using namespace std;

class Worker : public AsyncWorker
{
public:
	Worker(Callback *callback, function<void()> doWork, function<void(Callback* callback)> onOK)
		: AsyncWorker(callback)
		, doWork(doWork)
		, onOK(onOK)
	{}
	void Execute();
	void HandleOKCallback();
private:
	function<void()> doWork;
	function<void(Callback* callback)> onOK;
};