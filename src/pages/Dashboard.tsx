import { useMemo } from "react";
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
} from "lucide-react";
import { useAppStore } from "@/store";
import OrderCard from "@/components/OrderCard";
import { formatCurrency } from "@/utils/format";

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
    () => [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5),
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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
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
                <p className="text-sm text-navy-400">暂无订单记录，点击右上角「快速接车」开始</p>
              </div>
            ) : (
              recentOrders.map((o) => (
                <OrderCard key={o.id} order={o} compact />
              ))
            )}
          </div>
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

          {toPickup.length > 0 && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-800">
                    完工待取车提醒
                  </div>
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
