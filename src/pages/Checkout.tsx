import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  Car,
  User,
  Clock,
  CheckCircle2,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Coins,
  Ticket,
  Sparkles,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { useAppStore } from "@/store";
import type { PaymentMethod } from "@/types";
import { PAYMENT_METHOD_TEXT, STATUS_TEXT, CARD_TYPE_TEXT, CARD_TYPE_COLOR } from "@/types";
import { formatCurrency, formatDateTime, formatDuration } from "@/utils/format";

export default function Checkout() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const orders = useAppStore((s) => s.orders);
  const members = useAppStore((s) => s.members);
  const payOrder = useAppStore((s) => s.payOrder);

  const order = orders.find((o) => o.id === orderId);
  const member = useMemo(
    () => (order?.memberId ? members.find((m) => m.id === order.memberId) : undefined),
    [order, members]
  );

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const totalDuration = useMemo(() => {
    if (!order) return 0;
    return order.services.reduce((s, it) => {
      const svc = useAppStore.getState().services.find((x) => x.id === it.serviceId);
      return s + (svc?.duration || 0);
    }, 0);
  }, [order]);

  const canUseMemberTimes = useMemo(() => {
    if (!order || !member || member.cardType !== "times") return false;
    const washCount = order.services.filter((s) => s.serviceId === "S001").length;
    const hasOnlyWash = order.services.every((s) => s.serviceId === "S001");
    return hasOnlyWash && washCount > 0 && member.remainingTimes >= washCount;
  }, [order, member]);

  const canUseMemberBalance = useMemo(() => {
    if (!order || !member) return false;
    return member.balance >= order.payableAmount;
  }, [order, member]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-10 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy-900 mb-2">订单不存在</h2>
          <p className="text-sm text-navy-500 mb-6">
            无法找到该订单，请返回重新选择
          </p>
          <Link to="/construction" className="btn-primary inline-flex">
            <ArrowLeft className="h-4 w-4" />
            返回施工管理
          </Link>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    if (method === "member_times" && !canUseMemberTimes) {
      setErrMsg("次卡无法覆盖当前服务，请更换支付方式");
      return;
    }
    if (method === "member_balance" && !canUseMemberBalance) {
      setErrMsg("会员卡余额不足");
      return;
    }
    setErrMsg("");
    payOrder(order.id, method);
    setPaidSuccess(true);
  };

  if (paidSuccess) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in-up">
        <div className="card p-8 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-navy-50 opacity-60" />
          <div className="relative">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">结算成功</h2>
            <p className="text-sm text-navy-500 mb-6">
              订单 {order.plateNumber} 已完成支付，车辆状态已更新为「已取车」
            </p>
            <div className="rounded-2xl border-2 border-dashed border-navy-200 p-5 text-left bg-white/80 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">车牌号</span>
                <span className="font-bold text-navy-900 tracking-wider">
                  {order.plateNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">支付方式</span>
                <span className="font-medium text-navy-800">
                  {PAYMENT_METHOD_TEXT[order.paymentMethod || method]}
                </span>
              </div>
              <div className="border-t border-dashed border-navy-100 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="text-navy-600">实付金额</span>
                <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                  {formatCurrency(order.payableAmount)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/construction" className="btn-secondary flex-1">
                <ArrowLeft className="h-4 w-4" />
                返回施工管理
              </Link>
              <Link to="/reception" className="btn-primary flex-1">
                继续接车
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentOptions: {
    key: PaymentMethod;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    disabledReason?: string;
  }[] = [
    {
      key: "cash",
      label: "现金",
      desc: "当面收取现金",
      icon: Banknote,
    },
    {
      key: "wechat",
      label: "微信支付",
      desc: "扫码收款",
      icon: Smartphone,
    },
    {
      key: "alipay",
      label: "支付宝",
      desc: "扫码收款",
      icon: ScanLine,
    },
  ];

  if (member) {
    paymentOptions.push({
      key: "member_times",
      label: "次卡扣减",
      desc:
        member.cardType === "times"
          ? `剩余 ${member.remainingTimes} 次`
          : `当前为${CARD_TYPE_TEXT[member.cardType]}`,
      icon: Ticket,
      disabled: !canUseMemberTimes,
      disabledReason: canUseMemberTimes
        ? undefined
        : member.cardType !== "times"
        ? "当前会员卡不支持按次扣减"
        : "剩余次数不足或包含非普洗项目",
    });
    paymentOptions.push({
      key: "member_balance",
      label: "会员余额",
      desc: `余额 ${formatCurrency(member.balance)}`,
      icon: Wallet,
      disabled: !canUseMemberBalance,
      disabledReason: canUseMemberBalance ? undefined : "余额不足",
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-navy-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900">订单详情</h2>
                <p className="text-xs text-navy-500 -mt-0.5">
                  订单号：{order.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-navy-50/60 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Car className="h-4 w-4 text-navy-600" />
                </div>
                <div>
                  <div className="text-[11px] text-navy-400">车牌号</div>
                  <div className="font-bold text-navy-900 tracking-wider">
                    {order.plateNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Sparkles className="h-4 w-4 text-gold-600" />
                </div>
                <div>
                  <div className="text-[11px] text-navy-400">车型 / 颜色</div>
                  <div className="font-semibold text-navy-900">
                    {order.color} · {order.carModel}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Clock className="h-4 w-4 text-navy-600" />
                </div>
                <div>
                  <div className="text-[11px] text-navy-400">登记时间</div>
                  <div className="font-semibold text-navy-900 text-sm">
                    {formatDateTime(order.createdAt)}
                  </div>
                </div>
              </div>
              {order.memberName ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <User className="h-4 w-4 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-[11px] text-navy-400">会员</div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy-900">
                        {order.memberName}
                      </span>
                      {order.memberCardType && (
                        <span
                          className={`badge border text-[10px] ${CARD_TYPE_COLOR[order.memberCardType]}`}
                        >
                          {CARD_TYPE_TEXT[order.memberCardType]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Coins className="h-4 w-4 text-navy-600" />
                  </div>
                  <div>
                    <div className="text-[11px] text-navy-400">里程数</div>
                    <div className="font-semibold text-navy-900">
                      {order.mileage.toLocaleString("zh-CN")} km
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-navy-600 mb-2 px-1">
                服务项目明细
              </div>
              <div className="rounded-xl border border-navy-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-50/70 text-xs text-navy-600">
                      <th className="px-4 py-2.5 text-left font-semibold">项目</th>
                      <th className="px-4 py-2.5 text-center font-semibold">单价</th>
                      <th className="px-4 py-2.5 text-center font-semibold">数量</th>
                      <th className="px-4 py-2.5 text-right font-semibold">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {order.services.map((s) => (
                      <tr key={s.id} className="hover:bg-navy-50/30">
                        <td className="px-4 py-3 text-navy-900 font-medium">
                          {s.serviceName}
                        </td>
                        <td className="px-4 py-3 text-center text-navy-600">
                          {formatCurrency(s.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-center text-navy-600">
                          ×{s.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-navy-900">
                          {formatCurrency(s.unitPrice * s.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-navy-50/60 p-4 flex items-center justify-between text-sm">
              <span className="text-navy-600 inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                预计施工时长
              </span>
              <span className="font-bold text-navy-900">
                {formatDuration(totalDuration)}
              </span>
            </div>

            {order.status !== "picked_up" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700 border border-amber-200">
                当前状态：{STATUS_TEXT[order.status]}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-6 space-y-5">
            <div className="rounded-2xl border-2 border-navy-800 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white p-5">
              <div className="text-xs text-white/60 mb-1">应付金额</div>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold tracking-tight text-gold-400">
                  {formatCurrency(order.payableAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-white/50 line-through">
                    原价 {formatCurrency(order.totalAmount)}
                  </span>
                  <span className="text-emerald-300 inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    已优惠 {formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-navy-700" />
                选择支付方式
              </h3>
              <div className="space-y-2">
                {paymentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = method === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => !opt.disabled && setMethod(opt.key)}
                      disabled={opt.disabled}
                      className={`w-full text-left rounded-xl border-2 p-3.5 flex items-center gap-3 transition-all ${
                        selected
                          ? "border-navy-800 bg-navy-50 shadow-sm"
                          : opt.disabled
                          ? "border-navy-100 bg-navy-50/40 opacity-60 cursor-not-allowed"
                          : "border-navy-100 bg-white hover:border-navy-300"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-navy-800 text-white"
                            : "bg-navy-50 text-navy-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-900">
                            {opt.label}
                          </span>
                          {selected && (
                            <CheckCircle2 className="h-5 w-5 text-navy-800" />
                          )}
                        </div>
                        <div className={`text-xs mt-0.5 ${opt.disabled ? "text-red-500" : "text-navy-500"}`}>
                          {opt.disabled ? opt.disabledReason : opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {errMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errMsg}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                className="btn-primary w-full py-3 text-base"
                onClick={handlePay}
                disabled={
                  order.paid ||
                  (method === "member_times" && !canUseMemberTimes) ||
                  (method === "member_balance" && !canUseMemberBalance)
                }
              >
                <CheckCircle2 className="h-5 w-5" />
                确认支付 {formatCurrency(order.payableAmount)}
              </button>
              <button
                onClick={() => navigate("/construction")}
                className="btn-secondary w-full"
              >
                稍后结算
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
