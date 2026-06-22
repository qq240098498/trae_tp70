import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  MoveHorizontal,
  ZoomIn,
  Download,
  GitCompare,
} from "lucide-react";

interface PhotoCompareModalProps {
  open: boolean;
  onClose: () => void;
  plateNumber: string;
  beforePhotos: string[];
  afterPhotos: string[];
  services?: string[];
}

type ViewMode = "slider" | "side-by-side";

export default function PhotoCompareModal({
  open,
  onClose,
  plateNumber,
  beforePhotos,
  afterPhotos,
  services,
}: PhotoCompareModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [pairIdx, setPairIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const pairs = useMemo(() => {
    const max = Math.max(beforePhotos.length, afterPhotos.length, 1);
    return Array.from({ length: max }).map((_, i) => ({
      before: beforePhotos[i] || null,
      after: afterPhotos[i] || null,
    }));
  }, [beforePhotos, afterPhotos]);

  const current = pairs[pairIdx] || { before: null, after: null };

  useEffect(() => {
    setPairIdx(0);
    setSliderPos(50);
  }, [open]);

  if (!open) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSliderMove(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    handleSliderMove(e.clientX);
  };

  const downloadImage = (src: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${plateNumber}-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm p-4 animate-[fadeIn_.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col border border-navy-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <GitCompare className="text-gold-600" size={22} />
                <h3 className="text-xl font-bold text-navy-800">施工前后对比</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-navy-50 text-navy-700 border border-navy-200 font-medium">
                  {plateNumber}
                </span>
              </div>
              {services && services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {services.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-gold-50 text-gold-700 border border-gold-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <button
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition ${
                  viewMode === "slider"
                    ? "bg-navy-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MoveHorizontal size={14} />
                滑动对比
              </button>
              <button
                onClick={() => setViewMode("side-by-side")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition ${
                  viewMode === "side-by-side"
                    ? "bg-navy-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers size={14} />
                分屏查看
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {pairs.length > 1 && (
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-center gap-2">
            <button
              onClick={() => setPairIdx((p) => Math.max(0, p - 1))}
              disabled={pairIdx === 0}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1.5">
              {pairs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPairIdx(i)}
                  className={`px-3 py-1 text-xs rounded-md transition ${
                    i === pairIdx
                      ? "bg-navy-700 text-white font-medium"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  第 {i + 1} 组
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setPairIdx((p) => Math.min(pairs.length - 1, p + 1))
              }
              disabled={pairIdx === pairs.length - 1}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "slider" ? (
            <SliderView
              before={current.before}
              after={current.after}
              sliderPos={sliderPos}
              containerRef={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPreview={setPreviewSrc}
            />
          ) : (
            <SideBySideView
              before={current.before}
              after={current.after}
              onPreview={setPreviewSrc}
              onDownload={downloadImage}
            />
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              施工前 {beforePhotos.length} 张
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              施工后 {afterPhotos.length} 张
            </span>
            {!beforePhotos.length && (
              <span className="text-amber-600">* 未上传施工前照片</span>
            )}
            {!afterPhotos.length && (
              <span className="text-amber-600">* 未上传施工完成照片</span>
            )}
          </div>
          <button onClick={onClose} className="btn-secondary !py-1.5 !text-sm">
            关闭
          </button>
        </div>
      </div>

      {previewSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_.15s_ease-out]"
          onClick={() => setPreviewSrc(null)}
        >
          <img src={previewSrc} alt="" className="max-w-full max-h-full" />
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white"
            onClick={() => setPreviewSrc(null)}
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

function SliderView({
  before,
  after,
  sliderPos,
  containerRef,
  onPointerDown,
  onPointerMove,
  onPreview,
}: {
  before: string | null;
  after: string | null;
  sliderPos: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPreview: (s: string) => void;
}) {
  if (!before && !after) {
    return <EmptyCompare />;
  }
  if (!before || !after) {
    return <EmptyCompare missing={!before ? "before" : "after"} />;
  }
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video max-h-[60vh] mx-auto bg-slate-100 rounded-xl overflow-hidden select-none cursor-col-resize touch-none shadow-inner"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={() => onPreview(after)}
    >
      <img src={after} alt="after" className="absolute inset-0 w-full h-full object-contain bg-slate-900" />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={before}
          alt="before"
          className="absolute inset-0 h-full w-screen max-w-none object-contain bg-slate-900"
          style={{ width: `${100 * 100 / sliderPos}%`, maxWidth: "none" }}
        />
      </div>
      <div
        className="absolute inset-y-0"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-1 h-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.6)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none">
          <MoveHorizontal className="text-navy-700" size={22} />
        </div>
      </div>
      <LabelTag color="rose" text="施工前" position="left" />
      <LabelTag color="emerald" text="施工后" position="right" />
    </div>
  );
}

function SideBySideView({
  before,
  after,
  onPreview,
  onDownload,
}: {
  before: string | null;
  after: string | null;
  onPreview: (s: string) => void;
  onDownload: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
      <PhotoPane
        title="施工前"
        subtitle="Before"
        color="rose"
        src={before}
        onPreview={onPreview}
        onDownload={onDownload}
      />
      <PhotoPane
        title="施工后"
        subtitle="After"
        color="emerald"
        src={after}
        onPreview={onPreview}
        onDownload={onDownload}
      />
    </div>
  );
}

function PhotoPane({
  title,
  subtitle,
  color,
  src,
  onPreview,
  onDownload,
}: {
  title: string;
  subtitle: string;
  color: "rose" | "emerald";
  src: string | null;
  onPreview: (s: string) => void;
  onDownload: (s: string) => void;
}) {
  const bg = color === "rose" ? "from-rose-600 to-rose-500" : "from-emerald-600 to-emerald-500";
  const border = color === "rose" ? "border-rose-200" : "border-emerald-200";

  return (
    <div className={`rounded-xl overflow-hidden border ${border} shadow-sm flex flex-col`}>
      <div className={`bg-gradient-to-r ${bg} text-white px-4 py-2.5 flex items-center justify-between`}>
        <div>
          <div className="font-bold text-sm">{title}</div>
          <div className="text-[10px] opacity-80 tracking-wider">{subtitle}</div>
        </div>
        {src && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPreview(src)}
              className="p-1.5 rounded-md bg-white/15 hover:bg-white/25 transition"
              title="放大查看"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => onDownload(src)}
              className="p-1.5 rounded-md bg-white/15 hover:bg-white/25 transition"
              title="下载"
            >
              <Download size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="aspect-square flex items-center justify-center bg-slate-100">
        {src ? (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => onPreview(src)}
          />
        ) : (
          <span className="text-slate-400 text-sm">暂无照片</span>
        )}
      </div>
    </div>
  );
}

function LabelTag({
  color,
  text,
  position,
}: {
  color: "rose" | "emerald";
  text: string;
  position: "left" | "right";
}) {
  const bg = color === "rose" ? "bg-rose-500" : "bg-emerald-500";
  const pos = position === "left" ? "left-3 top-3" : "right-3 top-3";
  return (
    <span className={`absolute ${pos} text-white text-xs px-2.5 py-1 rounded-full shadow-md ${bg} font-medium`}>
      {text}
    </span>
  );
}

function EmptyCompare({ missing }: { missing?: "before" | "after" }) {
  const text =
    missing === "before"
      ? "缺少施工前照片，请先上传施工前的车辆记录"
      : missing === "after"
      ? "缺少施工完成照片，施工结束后请上传效果照片"
      : "请先上传施工前和施工后的照片进行对比";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <GitCompare size={44} strokeWidth={1.2} className="mb-3 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
