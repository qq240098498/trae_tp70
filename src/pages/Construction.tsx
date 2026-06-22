import { useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  PlayCircle,
  CircleCheckBig,
  HandCoins,
  PhoneCall,
  PhoneOff,
  MessageCircle,
  ArrowRightLeft,
  ListTodo,
} from "lucide-react";
import { useAppStore } from "@/store";
import OrderCard from "@/components/OrderCard";
import type { OrderStatus, Order } from "@/types";
import { STATUS_TEXT } from "@/types";
import { formatCurrency, getTimeAgo } from "@/utils/format";

interface Column {
  status: OrderStatus;
  icon: React.ComponentType<{ className?: string }>;
  headerClass: string;
  countBg: string;
}

const COLUMNS: Column[] = [
  {
    status: "pending",
    icon: ListTodo,
    headerClass: "from-navy-500 to-navy-700",
    countBg: "bg-navy-900/20",
  },
  {
    status: "in_progress",
    icon: PlayCircle,
    headerClass: "from-amber-500 to-amber-600",
    countBg: "bg-amber-900/20",
  },
  {
    status: "completed",
    icon: CircleCheckBig,
    headerClass: "from-emerald-500 to-emerald-600",
    countBg: "bg-emerald-900/20",
  },
  {
    status: "picked_up",
    icon: HandCoins,
    headerClass: "from-slate-400 to-slate-600",
    countBg: "bg-slate-900/20",
  },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: null,
  picked_up: null,
};

const PREV_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: null,
  in_progress: "pending",
  completed: "in_progress",
  picked_up: "completed",
};

export default function Construction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const orders = useAppStore((s) => s.orders);
  const updateOrderStatus = useAppStore((s) => s.updateOrderStatus);
  const markNotified = useAppStore((s) => s.markNotified);

  const grouped = useMemo(() => {
    const g: Record<OrderStatus, Order[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      picked_up: [],
    };
    orders.forEach((o) => {
      g[o.status].push(o);
    });
    (Object.keys(g) as OrderStatus[]).forEach((k) => {
      g[k].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    return g;
  }, [orders]);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`order-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-gold-400");
        }, 3000);
      }
    }
  }, [highlightId, orders]);

  const handleMove = (orderId: string, next: OrderStatus) => {
    updateOrderStatus(orderId, next);
  };

  const totalWaiting = grouped.pending.length + grouped.in_progress.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-navy-100 shadow-sm">
            <span className="text-sm text-navy-500">排队中</span>
            <span className="text-lg font-bold text-navy-900">{totalWaiting}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-200">
            <span className="text-sm text-emerald-600">待取车</span>
            <span className="text-lg font-bold text-emerald-700">
              {grouped.completed.length}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 border border-slate-200">
            <span className="text-sm text-slate-500">今日已完成</span>
            <span className="text-lg font-bold text-slate-700">
              {grouped.picked_up.length}
            </span>
          </div>
        </div>
        <Link to="/reception" className="btn-primary">
          + 新增接车
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const list = grouped[col.status];
          return (
            <div key={col.status} className="flex flex-col rounded-2xl overflow-hidden bg-navy-50/60 border border-navy-100">
              <div
                className={`flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r ${col.headerClass}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${col.countBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{STATUS_TEXT[col.status]}</div>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  {list.length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                {list.length === 0 ? (
                  <div className="h-32 flex items-center justify-center rounded-xl border-2 border-dashed border-navy-200 text-xs text-navy-400">
                    暂无订单
                  </div>
                ) : (
                  list.map((o) => (
                    <div
                      key={o.id}
                      id={`order-${o.id}`}
                      className={`transition-all duration-500 ${
                        highlightId === o.id ? "ring-4 ring-gold-400 rounded-xl" : ""
                      }`}
                    >
                      <OrderCard
                        order={o}
                        actions={
                          <div className="flex flex-wrap gap-2 w-full">
                            {col.status === "completed" && !o.paid && (
                              <>
                                {!o.notified ? (
                                  <button
                                    onClick={() => markNotified(o.id)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors flex-1"
                                  >
                                    <PhoneCall className="h-3.5 w-3.5" />
                                    通知取车
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 flex-1">
                                    <PhoneOff className="h-3.5 w-3.5" />
                                    已通知
                                  </span>
                                )}
                                <button
                                  onClick={() => navigate(`/checkout/${o.id}`)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-navy-800 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-navy-900 transition-colors flex-1"
                                >
                                  <HandCoins className="h-3.5 w-3.5" />
                                  收银结算
                                </button>
                              </>
                            )}

                            {col.status !== "picked_up" && NEXT_STATUS[col.status] && (
                              <button
                                onClick={() =>
                                  handleMove(o.id, NEXT_STATUS[col.status]!)
                                }
                                className={`inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white transition-colors flex-1 ${
                                  col.status === "completed"
                                    ? "bg-sky-500 hover:bg-sky-600"
                                    : col.status === "in_progress"
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-amber-500 hover:bg-amber-600"
                                }`}
                                style={col.status === "completed" ? { display: "none" } : {}}
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                {col.status === "pending"
                                  ? "开始施工"
                                  : "施工完成"}
                              </button>
                            )}

                            {PREV_STATUS[col.status] && col.status !== "picked_up" && (
                              <button
                                onClick={() =>
                                  handleMove(o.id, PREV_STATUS[col.status]!)
                                }
                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50 transition-colors"
                                title="回退状态"
                              >
                                ←
                              </button>
                            )}

                            {col.status === "picked_up" && (
                              <div className="w-full flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                  {getTimeAgo(o.pickedUpAt!)} 已取车
                                </span>
                                <span className="font-semibold text-slate-700">
                                  {formatCurrency(o.payableAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        }
                      />
                      <div className="px-1 pb-2 text-[11px] text-navy-400 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {getTimeAgo(o.createdAt)} 登记
                        {o.notified && col.status === "completed" && (
                          <span className="ml-auto text-emerald-600 font-medium">
                            已通知
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
