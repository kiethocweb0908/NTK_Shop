// Tạo file: components/UploadProgressModal.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, Upload, Info, AlertCircle, ListStart } from 'lucide-react';
import { clearUploadLogs } from '@/redux/admin/slices/adminProductsSlice';
const UploadProgressModal = ({ action }) => {
  const { operationLoading, uploadProgress, uploadLogs } = useSelector(
    (state) => state.adminProducts
  );

  useEffect(() => {
    clearUploadLogs();
  }, [operationLoading]);

  if (!operationLoading) return null;

  // Nhóm logs theo variant để dễ đọc
  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'info':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
        return 'text-blue-600 animate-pulse';
      case 'info':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  if (action === 'edit') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-200 ease-linear">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 w-full flex flex-col items-center justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              <h3 className="text-xl text-center font-semibold">
                Đang cập nhật sản phẩm...
              </h3>
            </div>
            <p className="text-gray-500 text-sm">
              Vui lòng không đóng trình duyệt trong quá trình này
            </p>
          </div>

          {/* Logs section */}
          <div className="mb-18">
            <div className="p-4">
              {uploadLogs.length <= 0 ? (
                <div className="w-full flex items-center gap-4 justify-center text-center text-gray-400 py-8">
                  <ListStart className="h-5 w-5 mx-auto" />
                  <p>Đang bắt đầu quá trình...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`w-full flex items-center justify-center gap-3 py-12 px-4 rounded-lg ${
                      uploadLogs[uploadLogs.length - 1].type === 'error'
                        ? 'bg-red-50 border border-red-100'
                        : uploadLogs[uploadLogs.length - 1].type === 'success'
                          ? 'bg-green-50 border border-green-100'
                          : 'bg-white'
                    }`}
                  >
                    <div>{getLogIcon(uploadLogs[uploadLogs.length - 1].type)}</div>
                    <p
                      className={`text-md ${getLogColor(uploadLogs[uploadLogs.length - 1].type)}`}
                    >
                      {uploadLogs[uploadLogs.length - 1].message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <div>
              <h3 className="text-xl font-semibold">Đang tạo sản phẩm...</h3>
              <p className="text-gray-500 text-sm">
                Vui lòng không đóng trình duyệt trong quá trình này
              </p>
            </div>
          </div>
        </div>

        {/* Progress bars (nếu có) */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="p-4 border-b bg-blue-50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Đang upload ảnh
            </h4>
            {Object.entries(uploadProgress).map(([variantId, progress]) => {
              const isError = progress === -1;
              const isComplete = progress === 100;

              return (
                <div key={variantId} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Biến thể {variantId}</span>
                    <span
                      className={
                        isError ? 'text-red-500' : isComplete ? 'text-green-500' : ''
                      }
                    >
                      {isError ? '❌ Lỗi' : isComplete ? '✅ Hoàn thành' : `${progress}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isError
                          ? 'bg-red-500'
                          : isComplete
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                      }`}
                      style={{ width: isError || isComplete ? '100%' : `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Logs section */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Chi tiết quá trình
            </h4>
          </div>

          <div className="p-4 overflow-y-auto max-h-[300px]">
            {uploadLogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Đang bắt đầu quá trình...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      log.type === 'error'
                        ? 'bg-red-50 border border-red-100'
                        : log.type === 'success'
                          ? 'bg-green-50 border border-green-100'
                          : 'bg-gray-50'
                    }`}
                  >
                    <div className="mt-0.5">{getLogIcon(log.type)}</div>
                    <div className="flex-1">
                      <p className={`text-sm ${getLogColor(log.type)}`}>{log.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Tổng số log: {uploadLogs.length}</div>
            <div className="text-sm">
              {uploadLogs.filter((log) => log.type === 'success').length} thành công •{' '}
              {uploadLogs.filter((log) => log.type === 'error').length} lỗi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProgressModal;
