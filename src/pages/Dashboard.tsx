import { useEffect, useMemo } from "react";
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

function WeatherCard() {
  const weatherLogs = useAppStore((s) => s.weatherLogs);
  const todayWeather = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return weatherLogs.find((w) => w.date === today);
  }, [weatherLogs]);

  if (!todayWeather) return null;

  const Icon = WeatherIconMap[todayWeather.condition];
  const isRainy = todayWeather.condition === "rainy" || todayWeather.condition === "stormy";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${
        isRainy
          ? "bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700"
          : "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400"
      }`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-12 bottom-0 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">今日天气</p>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="text-3xl font-bold tracking-tight">
              {WEATHER_TEXT[todayWeather.condition]}
            </p>
            <span className="text-lg text-white/80">{todayWeather.temperature}°C</span>
          </div>
          <p className="mt-1.5 text-xs text-white/80 max-w-[200px]">
            {todayWeather.description}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
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

  const { todayStr, isTodayRainy, pendingCoupons, issuedCoupons } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayWeather = weatherLogs.find((w) => w.date === today);
    const rainy =
      !!todayWeather &&
      (todayWeather.condition === "rainy" || todayWeather.condition === "stormy");
    return {
      todayStr: today,
      isTodayRainy: rainy,
      pendingCoupons: coupons.filter((c) => c.status === "pending"),
      issuedCoupons: coupons.filter((c) => c.status === "issued"),
    };
  }, [coupons, weatherLogs]);

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

      {pendingCoupons.length === 0 && issuedCoupons.length === 0 ? (
        <div className="text-center py-4 text-sm text-sky-600/70">
          暂无待推送的优惠券
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
