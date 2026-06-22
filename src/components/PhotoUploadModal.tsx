import { useState, useRef, useCallback } from "react";
import {
  X,
  Camera,
  Upload,
  Trash2,
  ZoomIn,
  ImagePlus,
  AlertCircle,
  ChevronRight,
  GitCompare,
} from "lucide-react";
import PhotoCompareModal from "./PhotoCompareModal";
import type { PhotoStage } from "@/types";

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  plateNumber: string;
  stage: PhotoStage;
  services?: string[];
  existingPhotos: string[];
  beforePhotosForReference?: string[];
  onConfirm: (photos: string[]) => void;
  allowCompare?: boolean;
}

export default function PhotoUploadModal({
  open,
  onClose,
  plateNumber,
  stage,
  services,
  existingPhotos,
  beforePhotosForReference = [],
  onConfirm,
  allowCompare = false,
}: PhotoUploadModalProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stageInfo =
    stage === "before"
      ? {
          title: "上传施工前照片",
          subtitle: "记录车辆原始状态，建议拍摄前后左右各角度",
          gradient: "from-rose-500 to-rose-600",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          tagColor: "rose",
          emptyText: "点击下方按钮上传施工前照片",
          minRequired: 1,
        }
      : {
          title: "上传施工完成照片",
          subtitle: "展示施工效果，建议与施工前相同角度拍摄",
          gradient: "from-emerald-500 to-emerald-600",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          tagColor: "emerald",
          emptyText: "点击下方按钮上传施工完成照片",
          minRequired: 1,
        };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        const newPhotos: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith("image/")) continue;
          const dataUrl = await readFileAsDataURL(file);
          newPhotos.push(dataUrl);
        }
        setPhotos((prev) => [...prev, ...newPhotos]);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    []
  );

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDelete = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    if (photos.length < stageInfo.minRequired) {
      return;
    }
    onConfirm(photos);
  };

  if (!open) return null;

  const canConfirm = photos.length >= stageInfo.minRequired;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm p-4 animate-[fadeIn_.15s_ease-out]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col border border-navy-100">
          <div
            className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${stageInfo.gradient} text-white rounded-t-2xl`}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Camera size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold">{stageInfo.title}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-medium">
                    {plateNumber}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">{stageInfo.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {stage === "after" && beforePhotosForReference.length > 0 && (
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertCircle size={14} className="text-amber-500" />
                <span>
                  已上传 <b className="text-rose-600">{beforePhotosForReference.length}</b>{" "}
                  张施工前照片作为参考
                </span>
              </div>
              {allowCompare && photos.length > 0 && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-navy-700 text-white hover:bg-navy-800 transition-colors"
                >
                  <GitCompare size={13} />
                  查看前后对比
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          )}

          {stage === "after" &&
            beforePhotosForReference.length > 0 &&
            photos.length === 0 && (
              <div className="px-6 pt-4">
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  施工前参考照片
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {beforePhotosForReference.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-rose-200 bg-slate-100 group"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover opacity-80"
                      />
                      <button
                        onClick={() => setPreviewSrc(src)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <ZoomIn size={18} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full bg-${stageInfo.tagColor}-500`}
                ></span>
                {stage === "before" ? "施工前照片" : "施工后照片"}（
                {photos.length} 张）
              </span>
              {photos.length < stageInfo.minRequired && (
                <span className="text-amber-600 font-medium">
                  至少上传 {stageInfo.minRequired} 张
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl py-16 flex flex-col items-center justify-center cursor-pointer hover:border-navy-400 hover:bg-navy-50/40 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-navy-100 transition-colors">
                  <ImagePlus size={32} className="text-slate-400 group-hover:text-navy-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1 group-hover:text-navy-800">
                  {stageInfo.emptyText}
                </p>
                <p className="text-xs text-slate-400">支持 JPG / PNG / WEBP，可多选</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white font-medium">
                        {i + 1}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <button
                          onClick={() => setPreviewSrc(src)}
                          className="p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-700 shadow-md transition-colors"
                          title="查看大图"
                        >
                          <ZoomIn size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          className="p-1.5 rounded-md bg-white/90 hover:bg-red-500 text-slate-700 hover:text-white shadow-md transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center hover:border-navy-400 hover:bg-navy-50/40 transition-all group disabled:opacity-50"
                >
                  <Upload
                    size={24}
                    className="text-slate-400 group-hover:text-navy-600 mb-1"
                  />
                  <span className="text-xs text-slate-500 group-hover:text-navy-700">
                    继续添加
                  </span>
                </button>
              </div>
            )}

            {services && services.length > 0 && (
              <div className="mt-5 p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                <div className="text-[11px] font-semibold text-navy-600 mb-1.5">
                  当前施工项目
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s, i) => (
                    <span
                      key={i}
                      className={`text-[11px] px-2 py-0.5 rounded border ${stageInfo.badgeBg}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-slate-50/40">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  canConfirm ? "bg-emerald-500" : "bg-amber-400"
                }`}
              ></span>
              {canConfirm
                ? "照片数量符合要求，可以提交"
                : `请至少上传 ${stageInfo.minRequired} 张照片`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || uploading}
                className={`btn-primary !px-5 ${
                  !canConfirm ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {stage === "before" ? "开始施工" : "确认完工"}
              </button>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {showCompare && (
        <PhotoCompareModal
          open={showCompare}
          onClose={() => setShowCompare(false)}
          plateNumber={plateNumber}
          beforePhotos={beforePhotosForReference}
          afterPhotos={photos}
          services={services}
        />
      )}

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
    </>
  );
}
