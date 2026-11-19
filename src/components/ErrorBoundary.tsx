import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Đã xảy ra lỗi không mong muốn.'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let friendlyDetail = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed && parsed.error) {
          friendlyDetail = `${parsed.error} (${parsed.operationType || 'read'} @ ${parsed.path || 'firestore'})`;
        }
      } catch {
        // Non-JSON error message
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hệ Thống Gặp Sự Cố Đồng Bộ Dữ Liệu
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Không thể hoàn tất thao tác đồng bộ dữ liệu Cloud Firestore. Vui lòng kiểm tra quyền truy cập tài khoản Google và thử tải lại trang.
              </p>
              {friendlyDetail && (
                <p className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 break-words">
                  {friendlyDetail}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải Lại Ứng Dụng</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
