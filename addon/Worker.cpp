#include "worker.h"

void Worker::Execute() { doWork(); }
void Worker::HandleOKCallback() { onOK(callback); }