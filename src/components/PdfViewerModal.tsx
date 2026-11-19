import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { SOPPdfAttachment } from '../types';
import { getPdfBlob, formatFileSize, downloadPdfAttachment } from '../utils/pdfStorage';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerModalProps {
  attachment: SOPPdfAttachment | null;
  sopTitle?: string;
  onClose: () => void;
}

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  registerPageRef: (pageNum: number, el: HTMLDivElement | null) => void;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  registerPageRef
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(pageNumber <= 3);
  const [renderedSize, setRenderedSize] = useState<{ width: number; height: number } | null>(null);
  const [rendering, setRendering] = useState(false);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      registerPageRef(pageNumber, el);
    },
    [pageNumber, registerPageRef]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    let renderTask: RenderTask | null = null;

    const renderPage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssViewport = page.getViewport({ scale, rotation });
        const renderViewport = page.getViewport({ scale: scale * dpr, rotation });

        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        canvas.style.width = `${Math.max(1, Math.floor(cssViewport.width))}px`;
        canvas.style.height = `${Math.max(1, Math.floor(cssViewport.height))}px`;

        setRenderedSize({
          width: Math.max(1, Math.floor(cssViewport.width)),
          height: Math.max(1, Math.floor(cssViewport.height))
        });

        renderTask = page.render({
          canvas,
          viewport: renderViewport
        });

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !cancelled) {
          console.warn(`PDF page ${pageNumber} render warning:`, err);
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore cancel error
        }
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation, isVisible]);

  return (
    <div
      ref={setRef}
      data-page-number={pageNumber}
      className="relative bg-white shadow-md border border-slate-200 rounded-md overflow-hidden flex items-center justify-center mx-auto shrink-0"
      style={
        renderedSize
          ? { width: renderedSize.width, height: renderedSize.height }
          : { width: Math.round(595 * scale), minHeight: Math.round(842 * scale) }
      }
    >
      <canvas ref={canvasRef} className="block bg-white" />
      {(!isVisible || rendering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            <span>Trang {pageNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  attachment,
  sopTitle,
  onClose
}) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasBlob, setHasBlob] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageNum, el);
    } else {
      pageRefs.current.delete(pageNum);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let currentLoadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

    const loadPdf = async () => {
      if (!attachment) {
        setPdfDoc(null);
        setNumPages(0);
        setCurrentPage(1);
        setHasBlob(false);
        setNotFound(false);
        setRenderError(null);
        return;
      }

      setLoading(true);
      setNotFound(false);
      setRenderError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setRotation(0);

      try {
        const blob = await getPdfBlob(attachment.id);
        if (!active) return;

        if (!blob) {
          setHasBlob(false);
          setNotFound(true);
          setLoading(false);
          return;
        }

        setHasBlob(true);
        const arrayBuffer = await blob.arrayBuffer();
        if (!active) return;

        // Calculate responsive initial scale based on viewport width
        const containerWidth = scrollContainerRef.current?.clientWidth || Math.min(window.innerWidth - 48, 920);
        const autoScale = Math.max(0.65, Math.min(1.35, Number(((containerWidth - 48) / 612).toFixed(2))));
        setScale(autoScale);

        currentLoadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true
        });
        const doc = await currentLoadingTask.promise;
        if (!active) {
          await currentLoadingTask.destroy();
          return;
        }

        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err: any) {
        if (!active) return;
        console.error('PDF load error:', err);
        setRenderError(err?.message || 'Không thể giải mã nội dung file PDF này.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (currentLoadingTask) {
        currentLoadingTask.destroy().catch(() => {});
      }
    };
  }, [attachment]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0) return;

    const containerTop = container.getBoundingClientRect().top;
    let closestPage = 1;
    let smallestDist = Infinity;

    pageRefs.current.forEach((el, pageNum) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerTop - 24);
      if (dist < smallestDist) {
        smallestDist = dist;
        closestPage = pageNum;
      }
    });

    setCurrentPage(closestPage);
  }, [numPages]);

  const scrollToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(numPages, pageNum));
    setCurrentPage(clamped);
    const el = pageRefs.current.get(clamped);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!attachment) return null;

  const handleDownload = async () => {
    const ok = await downloadPdfAttachment(attachment);
    if (!ok) {
      setNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {attachment.fileName}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {sopTitle ? `${sopTitle} · ` : ''}
                {formatFileSize(attachment.fileSize)} · Tải lên: {attachment.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasBlob && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Tải file PDF về máy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải xuống PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Controls Toolbar */}
        {pdfDoc && numPages > 0 && (
          <div className="px-3 py-1.5 bg-slate-800 text-slate-200 border-b border-slate-700 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => scrollToPage(currentPage - 1)}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1.5">
                Trang <strong>{currentPage}</strong> / {numPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= numPages}
                onClick={() => scrollToPage(currentPage + 1)}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.15).toFixed(2))))}
                className="p-1 rounded hover:bg-slate-700 cursor-pointer transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] min-w-[44px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}
                className="p-1 rounded hover:bg-slate-700 cursor-pointer transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 rounded hover:bg-slate-700 cursor-pointer transition-colors ml-1"
                title="Xoay trang 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Viewer Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 bg-slate-200/80 overflow-auto relative"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-600 text-xs p-6">
              <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
              <span>Đang tải và hiển thị tài liệu PDF...</span>
            </div>
          ) : notFound ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-md text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Không tìm thấy dữ liệu PDF cục bộ
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tệp <strong>{attachment.fileName}</strong> được lưu trong bộ nhớ trình duyệt (IndexedDB) tại thiết bị đã tải lên. Nếu dữ liệu trình duyệt đã bị xóa hoặc đang mở trên thiết bị khác, vui lòng đính kèm lại tệp PDF vào SOP này.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : renderError || !pdfDoc ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-md text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Không thể hiển thị trực tiếp tệp PDF
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {renderError || 'Định dạng PDF chưa thể dựng trang trực tiếp. Quý khách vẫn có thể tải xuống file PDF gốc để xem trên thiết bị.'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {hasBlob && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải xuống PDF</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 px-3 sm:px-6 space-y-4 min-w-fit">
              {Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
                <PdfPageCanvas
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  scale={scale}
                  rotation={rotation}
                  registerPageRef={registerPageRef}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
