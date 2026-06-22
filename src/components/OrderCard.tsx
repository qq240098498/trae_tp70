import {
  Car,
  Clock,
  PhoneCall,
  User,
  AlertCircle,
} from "lucide-react";
import type { Order } from "@/types";
import {
  STATUS_COLOR,
  STATUS_TEXT,
  CARD_TYPE_COLOR,
  CARD_TYPE_TEXT,
} from "@/types";
import { formatCurrency, formatTime, getTimeAgo } from "@/utils/format";

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  actions?: React.ReactNode;
  photoBadge?: React.ReactNode;
}

export default function OrderCard({ order, compact, actions, photoBadge }: OrderCardProps) {
  return (
    <div
      className={`card card-hover overflow-hidden ${
        order.status === "completed" && !order.notified
          ? "ring-2 ring-emerald-400 ring-offset-2 animate-pulse-soft"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
              order.status === "completed"
                ? "from-emerald-400 to-emerald-600 text-white"
                : order.status === "in_progress"
                ? "from-amber-400 to-amber-600 text-white"
                : order.status === "picked_up"
                ? "from-slate-300 to-slate-500 text-white"
                : "from-navy-400 to-navy-600 text-white"
            }`}
          >
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-navy-900 tracking-wide text-base">
                {order.plateNumber}
              </span>
              {order.status === "completed" && !order.notified && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-500 text-[10px] font-semibold px-2 py-0.5 text-white">
                  <PhoneCall className="h-3 w-3" /> 待通知取车
                </span>
              )}
              {photoBadge}
            </div>
            <div className="text-xs text-navy-500 mt-0.5 flex items-center gap-1.5">
              <span>{order.color}</span>
              <span className="w-1 h-1 rounded-full bg-navy-200" />
              <span>{order.carModel}</span>
              <span className="w-1 h-1 rounded-full bg-navy-200" />
              <span>
                {order.mileage.toLocaleString("zh-CN")} km
              </span>
            </div>
          </div>
        </div>
        <span
          className={`badge border shrink-0 ${STATUS_COLOR[order.status]}`}
        >
          {STATUS_TEXT[order.status]}
        </span>
      </div>

      {!compact && (
        <>
          <div className="mx-4 border-t border-dashed border-navy-100" />
          <div className="p-4 pt-3 space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {order.services.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700"
                >
                  {s.serviceName}
                  <span className="text-navy-400">
                    ¥{s.unitPrice}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-3 text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {getTimeAgo(order.createdAt)}
                </span>
                {order.memberName && (
                  <span
                    className={`badge border ${CARD_TYPE_COLOR[order.memberCardType!]}`}
                  >
                    <User className="h-3 w-3" />
                    {order.memberName} ·{" "}
                    {CARD_TYPE_TEXT[order.memberCardType!]}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-[11px] text-navy-400 line-through">
                  {order.discountAmount > 0 &&
                    formatCurrency(order.totalAmount)}
                </div>
                <div className="text-sm font-bold text-navy-900">
                  {formatCurrency(order.payableAmount)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {actions && (
        <>
          <div className="mx-4 border-t border-dashed border-navy-100" />
          <div className="p-3 flex gap-2">{actions}</div>
        </>
      )}

      {order.remark && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{order.remark}</span>
        </div>
      )}

      {compact && (
        <div className="px-4 pb-3 pt-1 flex items-center justify-between text-xs">
          <span className="text-navy-400">
            {formatTime(order.createdAt)} 登记
          </span>
          <span className="font-semibold text-navy-900">
            {formatCurrency(order.payableAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
