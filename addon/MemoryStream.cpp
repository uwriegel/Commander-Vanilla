#include <iterator>
#include "memorystream.h"
using namespace std;

HRESULT __stdcall MemoryStream::QueryInterface(REFIID iid, void **object)
{
	if (iid == IID_IUnknown) {
		*object = static_cast<IUnknown*>(this);
		return S_OK;
	}
	else if (iid == IID_IStream) {
		*object = static_cast<IStream*>(this);
		return S_OK;
	}
	else if (iid == IID_ISequentialStream) {
		*object = static_cast<ISequentialStream*>(this);
		return S_OK;
	}
	else {
		*object = nullptr;
		return E_NOINTERFACE;
	}
}

ULONG __stdcall MemoryStream::AddRef() { return 1; }
ULONG __stdcall MemoryStream::Release() { return 0; }

HRESULT __stdcall MemoryStream::Write(const void *pv, ULONG cb, ULONG *pcbWritten)
{
	auto bs = reinterpret_cast<const char*>(pv);
	copy(bs, bs + cb, back_inserter(bytes));
	*pcbWritten = cb;
	return S_OK;
}

HRESULT __stdcall MemoryStream::Read(void *pv, ULONG cb, ULONG *pcbRead) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::Seek(LARGE_INTEGER dlibMove, DWORD dwOrigin, ULARGE_INTEGER *plibNewPosition) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::SetSize(ULARGE_INTEGER libNewSize) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::CopyTo(IStream *pstm, ULARGE_INTEGER cb, ULARGE_INTEGER *pcbRead, ULARGE_INTEGER *pcbWritten) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::Commit(DWORD grfCommitFlags) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::Revert() { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::LockRegion(ULARGE_INTEGER libOffset, ULARGE_INTEGER cb, DWORD dwLockType) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::UnlockRegion(ULARGE_INTEGER libOffset, ULARGE_INTEGER cb, DWORD dwLockType) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::Stat(STATSTG *pstatstg, DWORD grfStatFlag) { return E_NOTIMPL; }
HRESULT __stdcall MemoryStream::Clone(IStream **ppstm) { return E_NOTIMPL; }
