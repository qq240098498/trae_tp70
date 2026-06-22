import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Car,
  BellRing,
  Users,
  ArrowRight,
  PlusCircle,
  CreditCard,
  ClipboardList,
  CloudRain,
  Gift,
  Send,
  CheckCircle2,
  Ticket,
  CloudSun,
  Sun,
  Cloud,
  CloudLightning,
  Pencil,
  X,
  Thermometer,
  Info,
  Sparkles,
  ShieldCheck,
  Sofa,
  CalendarDays,
  Wallet,
  AlertTriangle,
  Trash2,
  Save,
} from "lucide-react";
import { useAppStore } from "@/store";
import OrderCard from "@/components/OrderCard";
import { formatCurrency } from "@/utils/format";
import {
  COUPON_STATUS_COLOR,
  COUPON_STATUS_TEXT,
  WEATHER_TEXT,
  type Coupon,
  type WeatherCondition,
  type MaintenanceRecord,
  type MaintenanceType,
  MAINTENANCE_TEXT,
  MAINTENANCE_CYCLE_DAYS,
  MAINTENANCE_PRICE,
} from "@/types";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  gradient: string;
  iconBg: string;
  delay?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  gradient,
  iconBg,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{
        background: gradient,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-12 bottom-0 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint && (
            <p className="mt-1.5 text-xs text-white/70 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {hint}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

const WeatherIconMap: Record<WeatherCondition, React.ComponentType<{ className?: string }>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
};

const MaintenanceIconMap: Record<MaintenanceType, React.ComponentType<{ className?: string }>> = {
  wax: Sparkles,
  coating: ShieldCheck,
  interior_clean: Sofa,
};

const MaintenanceColorMap: Record<MaintenanceType, { gradient: string; badge: string }> = {
  wax: {
    gradient: "from-amber-400 to-orange-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  coating: {
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  interior_clean: {
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

function getMaintenanceStatus(nextDueDate: string): {
  status: "ok" | "warning" | "due" | "overdue";
  daysLeft: number;
  label: string;
  color: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (daysLeft < 0) {
    return {
      status: "overdue",
      daysLeft,
      label: `已超期 ${Math.abs(daysLeft)} 天`,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }
  if (daysLeft === 0) {
    return {
      status: "due",
      daysLeft,
      label: "今日到期",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (daysLeft <= 7) {
    return {
      status: "warning",
      daysLeft,
      label: `剩余 ${daysLeft} 天`,
      color: "bg-orange-50 text-orange-700 border-orange-200",
    };
  }
  return {
    status: "ok",
    daysLeft,
    label: `剩余 ${daysLeft} 天`,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

function WeatherCard() {
  const weatherLogs = useAppStore((s) => s.weatherLogs);
  const [editing, setEditing] = useState(false);
  const [formCondition, setFormCondition] = useState<WeatherCondition>("sunny");
  const [formTemp, setFormTemp] = useState<number>(25);
  const [formDesc, setFormDesc] = useState<string>("");

  const todayStr = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );
  const todayWeather = useMemo(
    () => weatherLogs.find((w) => w.date === todayStr),
    [weatherLogs, todayStr]
  );

  useEffect(() => {
    if (todayWeather && !editing) {
      setFormCondition(todayWeather.condition);
      setFormTemp(todayWeather.temperature);
      setFormDesc(todayWeather.description);
    }
  }, [todayWeather, editing]);

  const openEdit = () => {
    if (todayWeather) {
      setFormCondition(todayWeather.condition);
      setFormTemp(todayWeather.temperature);
      setFormDesc(todayWeather.description);
    }
    setEditing(true);
  };

  const handleSave = () => {
    useAppStore.setState((s) => {
      const recordedAt = new Date().toISOString();
      const existing = s.weatherLogs.find((w) => w.date === todayStr);
      let nextLogs;
      if (existing) {
        nextLogs = s.weatherLogs.map((w) =>
          w.date === todayStr
            ? {
                ...w,
                condition: formCondition,
                temperature: formTemp,
                description: formDesc,
                recordedAt,
              }
            : w
        );
      } else {
        nextLogs = [
          ...s.weatherLogs,
          {
            date: todayStr,
            condition: formCondition,
            temperature: formTemp,
            description: formDesc,
            recordedAt,
          },
        ];
      }
      return { weatherLogs: nextLogs };
    });
    setEditing(false);
  };

  const Icon = todayWeather ? WeatherIconMap[todayWeather.condition] : Pencil;
  const isRainy =
    !!todayWeather &&
    (todayWeather.condition === "rainy" || todayWeather.condition === "stormy");

  const cardClass = todayWeather
    ? (isRainy
        ? "bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700"
        : "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400")
    : "bg-gradient-to-br from-slate-500 to-slate-700";

  return (
    <>
      <button
        onClick={openEdit}
        className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg text-left hover:shadow-xl hover:scale-[1.01] transition-all group ${cardClass}`}
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -right-12 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
            <Pencil className="h-3 w-3" />
            {todayWeather ? "编辑" : "录入"}
          </span>
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">今日天气</p>
            {todayWeather ? (
              <>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="text-3xl font-bold tracking-tight">
                    {WEATHER_TEXT[todayWeather.condition]}
                  </p>
                  <span className="text-lg text-white/80">
                    {todayWeather.temperature}°C
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-white/80 max-w-[200px]">
                  {todayWeather.description}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight">点击录入</p>
                <p className="mt-1.5 text-xs text-white/80">
                  设置天气后可触发雨天顺延提醒
                </p>
              </>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </button>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4"
          onClick={() => setEditing(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  编辑今日天气
                </h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  修改后将立即触发雨天顺延优惠券检测
                </p>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">
                  天气状况
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { key: "sunny", label: "晴天", Icon: Sun, color: "bg-amber-50 border-amber-200 text-amber-700", activeColor: "bg-amber-500 text-white border-amber-500" },
                      { key: "cloudy", label: "多云", Icon: Cloud, color: "bg-slate-50 border-slate-200 text-slate-700", activeColor: "bg-slate-500 text-white border-slate-500" },
                      { key: "rainy", label: "小雨", Icon: CloudRain, color: "bg-sky-50 border-sky-200 text-sky-700", activeColor: "bg-sky-500 text-white border-sky-500" },
                      { key: "stormy", label: "暴雨", Icon: CloudLightning, color: "bg-indigo-50 border-indigo-200 text-indigo-700", activeColor: "bg-indigo-500 text-white border-indigo-500" },
                    ] as { key: WeatherCondition; label: string; Icon: React.ComponentType<{ className?: string }>; color: string; activeColor: string }[]
                  ).map((opt) => {
                    const active = formCondition === opt.key;
                    const OptIcon = opt.Icon;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFormCondition(opt.key)}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all ${
                          active ? opt.activeColor + " shadow-md" : opt.color + " hover:shadow"
                        }`}
                      >
                        <OptIcon className="h-6 w-6" />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">
                  温度 (°C)
                </label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <input
                    type="number"
                    value={formTemp}
                    onChange={(e) => setFormTemp(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-navy-100 bg-white py-2.5 pl-9 pr-3 text-navy-900 text-sm focus:border-navy-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">
                  天气描述
                </label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                    placeholder="例如：今日有小雨，洗车顾客可享雨后复洗半价"
                    className="w-full resize-none rounded-xl border-2 border-navy-100 bg-white py-2.5 pl-9 pr-3 text-navy-900 text-sm focus:border-navy-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              {formCondition === "rainy" || formCondition === "stormy" ? (
                <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-xs text-sky-700 flex items-start gap-2">
                  <CloudRain className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">检测到雨天：</span>
                    保存后将为昨日已取车的客户自动创建「雨后复洗半价券」
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2">
                  <Sun className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">天气晴好：</span>
                    不会触发雨天顺延提醒
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-navy-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border-2 border-navy-100 bg-white py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-navy-700 to-navy-900 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CouponItem({
  coupon,
  onIssue,
}: {
  coupon: Coupon;
  onIssue: (id: string) => void;
}) {
  const daysLeft = useMemo(() => {
    const target = new Date(coupon.expiresAt);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }, [coupon.expiresAt]);

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900">
              {coupon.plateNumber}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${COUPON_STATUS_COLOR[coupon.status]}`}
            >
              {COUPON_STATUS_TEXT[coupon.status]}
            </span>
          </div>
          {coupon.memberName && (
            <p className="text-xs text-navy-500 mt-0.5">
              {coupon.memberName}
              {coupon.memberPhone ? ` · ${coupon.memberPhone}` : ""}
            </p>
          )}
          <p className="text-[11px] text-navy-400 mt-0.5">
            有效期剩余 {daysLeft} 天
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="text-lg font-bold text-sky-600">
            {coupon.discount}%
            <span className="text-[10px] font-normal text-navy-400 ml-1">OFF</span>
          </div>
          {coupon.status === "pending" && (
            <button
              onClick={() => onIssue(coupon.id)}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:from-sky-600 hover:to-sky-700 transition-colors"
            >
              <Send className="h-3 w-3" />
              推送
            </button>
          )}
          {coupon.status === "issued" && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              已推送
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function RainReminderPanel() {
  const coupons = useAppStore((s) => s.coupons);
  const weatherLogs = useAppStore((s) => s.weatherLogs);
  const orders = useAppStore((s) => s.orders);
  const members = useAppStore((s) => s.members);
  const services = useAppStore((s) => s.services);

  const { todayStr, isTodayRainy, pendingCoupons, issuedCoupons, washedYesterdayCount } =
    useMemo(() => {
      const today = new Date().toISOString().slice(0, 10);
      const todayWeather = weatherLogs.find((w) => w.date === today);
      const rainy =
        !!todayWeather &&
        (todayWeather.condition === "rainy" || todayWeather.condition === "stormy");

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const washedY = orders.filter((o) => {
        if (!o.pickedUpAt) return false;
        const pickedDate = new Date(o.pickedUpAt).toISOString().slice(0, 10);
        return pickedDate === yStr && o.paid;
      });

      return {
        todayStr: today,
        isTodayRainy: rainy,
        pendingCoupons: coupons.filter((c) => c.status === "pending"),
        issuedCoupons: coupons.filter((c) => c.status === "issued"),
        washedYesterdayCount: washedY.length,
      };
    }, [coupons, weatherLogs, orders]);

  useEffect(() => {
    if (!isTodayRainy) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const washedYesterday = orders.filter((o) => {
      if (!o.pickedUpAt) return false;
      const pickedDate = new Date(o.pickedUpAt).toISOString().slice(0, 10);
      return pickedDate === yesterdayStr && o.paid;
    });

    const state = useAppStore.getState();
    let hasNew = false;
    const newCoupons = [];

    for (const order of washedYesterday) {
      const exists = state.coupons.find(
        (c) => c.orderId === order.id && c.type === "rain_rewash_half"
      );
      if (exists) continue;

      const member = order.memberId
        ? members.find((m) => m.id === order.memberId)
        : undefined;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      newCoupons.push({
        id: `C${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        type: "rain_rewash_half" as const,
        name: "雨后复洗半价券",
        description: "昨日洗车今日遇雨，凭券享受精洗/普洗半价优惠",
        discount: 50,
        discountType: "percent" as const,
        orderId: order.id,
        plateNumber: order.plateNumber,
        memberId: member?.id,
        memberName: member?.name,
        memberPhone: member?.phone,
        status: "pending" as const,
        rainDate: todayStr,
        washDate: yesterdayStr,
        expiresAt: expiresAt.toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      });
      hasNew = true;
    }

    if (hasNew) {
      useAppStore.setState((s) => ({ coupons: [...newCoupons, ...s.coupons] }));
    }
  }, [isTodayRainy, todayStr, orders, members]);

  const handleIssue = (couponId: string) => {
    const now = new Date().toISOString();
    useAppStore.setState((s) => ({
      coupons: s.coupons.map((c) =>
        c.id === couponId ? { ...c, status: "issued" as const, issuedAt: now } : c
      ),
    }));
  };

  const handleIssueAll = () => {
    const now = new Date().toISOString();
    useAppStore.setState((s) => ({
      coupons: s.coupons.map((c) =>
        c.status === "pending" ? { ...c, status: "issued" as const, issuedAt: now } : c
      ),
    }));
  };

  const handleAddDemoWash = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    const yCreated = new Date(yesterday.getTime() - 5 * 3600 * 1000);
    const yStart = new Date(yesterday.getTime() - 3 * 3600 * 1000);
    const yPickup = new Date(yesterday.getTime());
    const washService = services.find((s) => s.category === "wash") || services[0];
    const demoPlates = ["京Q88888", "京D66666", "沪E99999", "京A55555", "川B33333"];
    const existing = new Set(orders.map((o) => o.plateNumber));
    const plate = demoPlates.find((p) => !existing.has(p)) || `京X${Math.floor(Math.random() * 90000 + 10000)}`;

    const demoOrder = {
      id: `O${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      plateNumber: plate,
      carModel: "轿车",
      color: "白色",
      mileage: 20000 + Math.floor(Math.random() * 30000),
      status: "picked_up" as const,
      notified: true,
      services: [
        {
          id: `s${Date.now().toString(36)}`,
          serviceId: washService.id,
          serviceName: washService.name,
          unitPrice: washService.price,
          quantity: 1,
          subtotal: washService.price,
        },
      ],
      totalAmount: washService.price,
      discountAmount: 0,
      payableAmount: washService.price,
      paid: true,
      paymentMethod: "wechat" as const,
      createdAt: yCreated.toISOString(),
      startedAt: yStart.toISOString(),
      completedAt: yPickup.toISOString(),
      pickedUpAt: yPickup.toISOString(),
      beforePhotos: [] as string[],
      afterPhotos: [] as string[],
    };

    useAppStore.setState((s) => ({ orders: [demoOrder, ...s.orders] }));
  };

  if (!isTodayRainy) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-800">天气晴好</div>
            <div className="text-xs text-emerald-600">今日无雨，无需顺延提醒</div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = pendingCoupons.length === 0 && issuedCoupons.length === 0;

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/50 to-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sky-800">雨天顺延提醒</div>
            <div className="text-xs text-sky-600">
              昨日洗车 · 今日遇雨 · 自动发放半价券
            </div>
          </div>
        </div>
        {pendingCoupons.length > 0 && (
          <button
            onClick={handleIssueAll}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:from-sky-600 hover:to-indigo-600 transition-colors"
          >
            <Gift className="h-3.5 w-3.5" />
            一键推送全部
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="space-y-3">
          <div className="text-center py-4 text-sm text-sky-600/70">
            暂无待推送的优惠券
            <span className="block text-xs text-sky-500/70 mt-1">
              昨日已取车订单：{washedYesterdayCount} 单
            </span>
          </div>
          {washedYesterdayCount === 0 && (
            <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-sky-800 mb-1">
                    演示环境测试入口
                  </div>
                  <div className="text-[11px] text-sky-600 mb-2">
                    未检测到昨日已取车订单，点击下方按钮生成 1 条昨日已完成的洗车订单，立即体验优惠券自动生成流程
                  </div>
                  <button
                    onClick={handleAddDemoWash}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-600 transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    生成昨日已洗车测试订单
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {pendingCoupons.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-sky-700 mb-1.5">
                待推送 ({pendingCoupons.length})
              </div>
              <div className="space-y-2">
                {pendingCoupons.slice(0, 5).map((c) => (
                  <CouponItem key={c.id} coupon={c} onIssue={handleIssue} />
                ))}
                {pendingCoupons.length > 5 && (
                  <p className="text-center text-xs text-sky-500 pt-1">
                    还有 {pendingCoupons.length - 5} 条待推送...
                  </p>
                )}
              </div>
            </div>
          )}

          {issuedCoupons.length > 0 && (
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1.5">
                今日已推送 ({issuedCoupons.length})
              </div>
              <div className="space-y-2">
                {issuedCoupons.slice(0, 3).map((c) => (
                  <CouponItem key={c.id} coupon={c} onIssue={handleIssue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CouponsPanel() {
  const coupons = useAppStore((s) => s.coupons);

  const stats = useMemo(() => {
    const total = coupons.length;
    const pending = coupons.filter((c) => c.status === "pending").length;
    const issued = coupons.filter((c) => c.status === "issued").length;
    const used = coupons.filter((c) => c.status === "used").length;
    return { total, pending, issued, used };
  }, [coupons]);

  const recentCoupons = useMemo(
    () =>
      [...coupons]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6),
    [coupons]
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-navy-900">优惠券管理</div>
            <div className="text-xs text-navy-500 mt-0.5">雨后复洗半价券发放记录</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="text-center px-2.5 py-1 rounded-lg bg-amber-50">
            <div className="text-sm font-bold text-amber-700">{stats.pending}</div>
            <div className="text-[10px] text-amber-600">待推送</div>
          </div>
          <div className="text-center px-2.5 py-1 rounded-lg bg-sky-50">
            <div className="text-sm font-bold text-sky-700">{stats.issued}</div>
            <div className="text-[10px] text-sky-600">已推送</div>
          </div>
          <div className="text-center px-2.5 py-1 rounded-lg bg-emerald-50">
            <div className="text-sm font-bold text-emerald-700">{stats.used}</div>
            <div className="text-[10px] text-emerald-600">已使用</div>
          </div>
        </div>
      </div>

      {recentCoupons.length === 0 ? (
        <div className="text-center py-6 text-sm text-navy-400">
          暂无优惠券记录
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recentCoupons.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-navy-100 bg-gradient-to-r from-white to-navy-50/30 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-900 text-sm">
                      {c.plateNumber}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${COUPON_STATUS_COLOR[c.status]}`}
                    >
                      {COUPON_STATUS_TEXT[c.status]}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-0.5 truncate">
                    {c.memberName || "散客"} · {c.name}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-base font-bold text-violet-600">
                    {c.discount}%
                  </div>
                  <div className="text-[10px] text-navy-400">半价</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaintenanceAddModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const members = useAppStore((s) => s.members);
  const addMaintenanceRecord = useAppStore((s) => s.addMaintenanceRecord);

  const [formPlate, setFormPlate] = useState("");
  const [formType, setFormType] = useState<MaintenanceType>("wax");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formMemberId, setFormMemberId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setFormPlate("");
      setFormType("wax");
      setFormDate(new Date().toISOString().slice(0, 10));
      setFormMemberId("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!formPlate.trim()) return;
    addMaintenanceRecord({
      plateNumber: formPlate,
      type: formType,
      serviceDate: formDate,
      memberId: formMemberId || undefined,
    });
    onClose();
  };

  const cycleDays = MAINTENANCE_CYCLE_DAYS[formType];
  const nextDue = new Date(formDate);
  nextDue.setDate(nextDue.getDate() + cycleDays);
  const nextDueStr = nextDue.toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-navy-900">录入保养记录</h3>
            <p className="text-xs text-navy-500 mt-0.5">
              记录打蜡/镀晶/内饰清洗，自动计算下次保养日期
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-2">
              车牌号
            </label>
            <input
              type="text"
              value={formPlate}
              onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
              placeholder="例如：京A88888"
              className="w-full rounded-xl border-2 border-navy-100 bg-white py-2.5 px-3 text-navy-900 text-sm uppercase focus:border-navy-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-2">
              保养类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "wax" as const, label: "打蜡", Icon: Sparkles, price: MAINTENANCE_PRICE.wax },
                  { key: "coating" as const, label: "镀晶", Icon: ShieldCheck, price: MAINTENANCE_PRICE.coating },
                  { key: "interior_clean" as const, label: "内饰清洗", Icon: Sofa, price: MAINTENANCE_PRICE.interior_clean },
                ]
              ).map((opt) => {
                const active = formType === opt.key;
                const OptIcon = opt.Icon;
                const colors = MaintenanceColorMap[opt.key];
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFormType(opt.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all ${
                      active
                        ? `bg-gradient-to-br ${colors.gradient} text-white border-transparent shadow-md`
                        : `${colors.badge} hover:shadow`
                    }`}
                  >
                    <OptIcon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className={`text-[10px] ${active ? "text-white/80" : "text-navy-500"}`}>
                      {formatCurrency(opt.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-2">
              服务日期
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-xl border-2 border-navy-100 bg-white py-2.5 pl-9 pr-3 text-navy-900 text-sm focus:border-navy-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-2">
              关联会员（可选）
            </label>
            <select
              value={formMemberId}
              onChange={(e) => setFormMemberId(e.target.value)}
              className="w-full rounded-xl border-2 border-navy-100 bg-white py-2.5 px-3 text-navy-900 text-sm focus:border-navy-400 focus:outline-none transition-colors"
            >
              <option value="">不关联会员</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl border-2 border-navy-100 bg-navy-50/50 p-3">
            <div className="flex items-center gap-2 text-xs text-navy-600">
              <Info className="h-4 w-4 text-navy-400 shrink-0" />
              <div>
                <span className="font-semibold">下次保养日期：</span>
                {nextDueStr}（{MAINTENANCE_TEXT[formType]}周期 {cycleDays} 天）
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-t border-navy-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-navy-100 bg-white py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formPlate.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-navy-700 to-navy-900 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center justify-center gap-1">
              <Save className="h-4 w-4" />
              保存记录
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MaintenanceReminderCard({
  record,
  onIssue,
}: {
  record: MaintenanceRecord;
  onIssue: (id: string) => void;
}) {
  const members = useAppStore((s) => s.members);
  const member = record.memberId ? members.find((m) => m.id === record.memberId) : undefined;
  const balance = member?.balance ?? 0;
  const status = getMaintenanceStatus(record.nextDueDate);
  const Icon = MaintenanceIconMap[record.type];
  const colors = MaintenanceColorMap[record.type];

  const isUrgent = status.status === "overdue" || status.status === "due";

  return (
    <div
      className={`rounded-xl border-2 p-3 ${
        isUrgent
          ? "border-rose-200 bg-gradient-to-r from-rose-50 to-white"
          : "border-orange-200 bg-gradient-to-r from-orange-50 to-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-navy-900">{record.plateNumber}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}
            >
              <Icon className="h-3 w-3 mr-0.5" />
              {MAINTENANCE_TEXT[record.type]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.color}`}
            >
              {isUrgent && <AlertTriangle className="h-3 w-3 mr-0.5" />}
              {status.label}
            </span>
          </div>
          {record.memberName && (
            <div className="flex items-center gap-2 mt-1 text-xs text-navy-500">
              <span>
                {record.memberName}
                {record.memberPhone ? ` · ${record.memberPhone}` : ""}
              </span>
            </div>
          )}
          {member && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              <Wallet className="h-3 w-3 text-emerald-500" />
              <span className="text-navy-500">会员余额：</span>
              <span className={`font-semibold ${balance > 0 ? "text-emerald-600" : "text-navy-400"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          )}
          <div className="text-[11px] text-navy-400 mt-0.5">
            上次服务：{record.serviceDate} · 到期日：{record.nextDueDate}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {!record.reminderIssued ? (
            <button
              onClick={() => onIssue(record.id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-white shadow-sm transition-colors ${
                isUrgent
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              }`}
            >
              <Send className="h-3 w-3" />
              推送提醒
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              已推送
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MaintenanceReminderPanel() {
  const reminders = useAppStore((s) => s.maintenanceRecords);
  const issueMaintenanceReminder = useAppStore((s) => s.issueMaintenanceReminder);

  const { sortedReminders, pendingCount, issuedCount, overdueCount } = useMemo(() => {
    const filtered = reminders.filter((r) => {
      const st = getMaintenanceStatus(r.nextDueDate);
      return st.status !== "ok";
    });
    const sorted = [...filtered].sort((a, b) => {
      const sa = getMaintenanceStatus(a.nextDueDate);
      const sb = getMaintenanceStatus(b.nextDueDate);
      return sa.daysLeft - sb.daysLeft;
    });
    return {
      sortedReminders: sorted,
      pendingCount: sorted.filter((r) => !r.reminderIssued).length,
      issuedCount: sorted.filter((r) => r.reminderIssued).length,
      overdueCount: sorted.filter(
        (r) => getMaintenanceStatus(r.nextDueDate).status === "overdue"
      ).length,
    };
  }, [reminders]);

  const handleIssueAll = () => {
    sortedReminders.forEach((r) => {
      if (!r.reminderIssued) {
        issueMaintenanceReminder(r.id);
      }
    });
  };

  if (sortedReminders.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-800">保养状态良好</div>
            <div className="text-xs text-emerald-600">暂无即将到期或已超期的保养项目</div>
          </div>
        </div>
      </div>
    );
  }

  const panelColor =
    overdueCount > 0
      ? "border-rose-200 from-rose-50 via-rose-50/50 to-white"
      : "border-orange-200 from-orange-50 via-orange-50/50 to-white";
  const headerColor = overdueCount > 0 ? "bg-rose-500" : "bg-orange-500";
  const headerTextColor = overdueCount > 0 ? "text-rose-800" : "text-orange-800";
  const subTextColor = overdueCount > 0 ? "text-rose-600" : "text-orange-600";
  const btnGradient =
    overdueCount > 0
      ? "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
      : "from-orange-500 to-indigo-500 hover:from-orange-600 hover:to-indigo-600";

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-5 ${panelColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${headerColor}`}>
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <div className={`font-bold ${headerTextColor}`}>保养周期提醒</div>
            <div className={`text-xs ${subTextColor}`}>
              到期前7天自动提醒 · 共 {sortedReminders.length} 项待关注
            </div>
          </div>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleIssueAll}
            className={`inline-flex items-center gap-1 rounded-xl bg-gradient-to-r px-3 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all ${btnGradient}`}
          >
            <Gift className="h-3.5 w-3.5" />
            一键推送全部 ({pendingCount})
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        {overdueCount > 0 && (
          <div className="text-center px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100">
            <div className="text-sm font-bold text-rose-700">{overdueCount}</div>
            <div className="text-[10px] text-rose-600">已超期</div>
          </div>
        )}
        <div className="text-center px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100">
          <div className="text-sm font-bold text-amber-700">{pendingCount}</div>
          <div className="text-[10px] text-amber-600">待推送</div>
        </div>
        <div className="text-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="text-sm font-bold text-emerald-700">{issuedCount}</div>
          <div className="text-[10px] text-emerald-600">已推送</div>
        </div>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {sortedReminders.map((r) => (
          <MaintenanceReminderCard
            key={r.id}
            record={r}
            onIssue={issueMaintenanceReminder}
          />
        ))}
      </div>
    </div>
  );
}

function MaintenancePanel() {
  const maintenanceRecords = useAppStore((s) => s.maintenanceRecords);
  const deleteMaintenanceRecord = useAppStore((s) => s.deleteMaintenanceRecord);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const stats = useMemo(() => {
    const total = maintenanceRecords.length;
    const waxCount = maintenanceRecords.filter((r) => r.type === "wax").length;
    const coatingCount = maintenanceRecords.filter((r) => r.type === "coating").length;
    const interiorCount = maintenanceRecords.filter((r) => r.type === "interior_clean").length;
    return { total, waxCount, coatingCount, interiorCount };
  }, [maintenanceRecords]);

  const recentRecords = useMemo(
    () =>
      [...maintenanceRecords]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8),
    [maintenanceRecords]
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-navy-900">保养周期管理</div>
            <div className="text-xs text-navy-500 mt-0.5">
              打蜡/镀晶/内饰清洗记录与周期联动
            </div>
          </div>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-navy-700 to-navy-900 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-lg transition-shadow"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          录入记录
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="text-center px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
          <div className="text-sm font-bold text-indigo-700">{stats.total}</div>
          <div className="text-[10px] text-indigo-600">总记录</div>
        </div>
        <div className="text-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
          <div className="text-sm font-bold text-amber-700">{stats.waxCount}</div>
          <div className="text-[10px] text-amber-600">打蜡</div>
        </div>
        <div className="text-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
          <div className="text-sm font-bold text-blue-700">{stats.coatingCount}</div>
          <div className="text-[10px] text-blue-600">镀晶</div>
        </div>
        <div className="text-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="text-sm font-bold text-emerald-700">{stats.interiorCount}</div>
          <div className="text-[10px] text-emerald-600">内饰清洗</div>
        </div>
      </div>

      {recentRecords.length === 0 ? (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-50 mb-3">
            <CalendarDays className="h-8 w-8 text-navy-300" />
          </div>
          <p className="text-sm text-navy-400 mb-3">暂无保养记录</p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            立即录入第一条记录
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recentRecords.map((r) => {
            const status = getMaintenanceStatus(r.nextDueDate);
            const Icon = MaintenanceIconMap[r.type];
            const colors = MaintenanceColorMap[r.type];
            return (
              <div
                key={r.id}
                className="rounded-xl border border-navy-100 bg-gradient-to-r from-white to-navy-50/30 p-3 relative group"
              >
                <button
                  onClick={() => {
                    if (confirm(`确认删除 ${r.plateNumber} 的${MAINTENANCE_TEXT[r.type]}记录？`)) {
                      deleteMaintenanceRecord(r.id);
                    }
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-md hover:bg-rose-50 text-navy-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center justify-between pr-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-navy-900 text-sm">
                        {r.plateNumber}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
                      >
                        <Icon className="h-3 w-3 mr-0.5" />
                        {MAINTENANCE_TEXT[r.type]}
                      </span>
                    </div>
                    <p className="text-[11px] text-navy-500 mt-1">
                      服务：{r.serviceDate} → 下次：{r.nextDueDate}
                    </p>
                    {r.memberName && (
                      <p className="text-[11px] text-navy-400 mt-0.5 truncate">
                        {r.memberName}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MaintenanceAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}

export default function Dashboard() {
  const orders = useAppStore((s) => s.orders);
  const members = useAppStore((s) => s.members);

  const { stats, toPickup } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    );
    const revenue = todayOrders
      .filter((o) => o.paid)
      .reduce((s, o) => s + o.payableAmount, 0);
    const inProgress = orders.filter(
      (o) => o.status === "in_progress" || o.status === "pending"
    ).length;
    const completedOrders = orders.filter((o) => o.status === "completed");
    return {
      stats: {
        revenue: Math.round(revenue * 100) / 100,
        inProgress,
        toPickup: completedOrders.length,
        totalMembers: members.length,
      },
      toPickup: completedOrders,
    };
  }, [orders, members]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const quickActions = [
    {
      label: "快速接车",
      desc: "录入车辆信息开单",
      to: "/reception",
      icon: PlusCircle,
      color: "from-navy-700 to-navy-900 text-white",
      iconColor: "bg-gold-400 text-navy-900",
    },
    {
      label: "保养周期",
      desc: "打蜡/镀晶/内饰清洗管理",
      to: "/maintenance",
      icon: CalendarDays,
      color: "from-indigo-500 to-purple-700 text-white",
      iconColor: "bg-white/20 text-white",
    },
    {
      label: "会员开卡",
      desc: "新会员注册登记",
      to: "/members",
      icon: CreditCard,
      color: "from-violet-500 to-violet-700 text-white",
      iconColor: "bg-white/20 text-white",
    },
    {
      label: "施工队列",
      desc: "查看在洗车辆",
      to: "/construction",
      icon: ClipboardList,
      color: "from-sky-500 to-sky-700 text-white",
      iconColor: "bg-white/20 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={TrendingUp}
          label="今日营业额"
          value={formatCurrency(stats.revenue)}
          hint="已完成订单统计"
          gradient="linear-gradient(135deg, #0F2C59 0%, #2F5499 100%)"
          iconBg="bg-gold-400 text-navy-900"
        />
        <StatCard
          icon={Car}
          label="在洗车辆"
          value={stats.inProgress}
          hint="待施工+施工中"
          gradient="linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
          iconBg="bg-white/25 text-white"
        />
        <StatCard
          icon={BellRing}
          label="待取车辆"
          value={stats.toPickup}
          hint={toPickup.length > 0 ? `有${toPickup.length}台待通知` : "暂无待取"}
          gradient="linear-gradient(135deg, #059669 0%, #10B981 100%)"
          iconBg="bg-white/25 text-white"
        />
        <StatCard
          icon={Users}
          label="会员总数"
          value={stats.totalMembers}
          hint="累计注册会员"
          gradient="linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)"
          iconBg="bg-white/25 text-white"
        />
        <WeatherCard />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">最近订单</h2>
                <p className="text-xs text-navy-500 mt-0.5">最近5条订单动态</p>
              </div>
              <Link
                to="/construction"
                className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
              >
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-sm text-navy-400">
                    暂无订单记录，点击右上角「快速接车」开始
                  </p>
                </div>
              ) : (
                recentOrders.map((o) => (
                  <OrderCard key={o.id} order={o} compact />
                ))
              )}
            </div>
          </div>

          <MaintenancePanel />
          <CouponsPanel />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-navy-900">快捷操作</h2>
            <p className="text-xs text-navy-500 mt-0.5">常用功能一键直达</p>
          </div>
          <div className="space-y-3">
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.to}
                  to={act.to}
                  className="card card-hover group block"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${act.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-navy-900">
                        {act.label}
                      </div>
                      <div className="text-xs text-navy-500 mt-0.5">
                        {act.desc}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-navy-300 group-hover:text-navy-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>

          <MaintenanceReminderPanel />
          <RainReminderPanel />

          {toPickup.length > 0 && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-800">完工待取车提醒</div>
                  <div className="text-xs text-emerald-600">
                    共 {toPickup.length} 台车辆已完工
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {toPickup.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-navy-900">
                      {o.plateNumber}
                    </span>
                    <Link
                      to={`/checkout/${o.id}`}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      去结算 →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
