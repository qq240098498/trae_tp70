import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  ClipboardList,
  Users,
  Sparkles,
  Car,
  CalendarDays,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/",
    label: "工作台",
    icon: LayoutDashboard,
    desc: "数据概览与快捷操作",
  },
  {
    to: "/reception",
    label: "接车登记",
    icon: ClipboardPlus,
    desc: "录入车辆与服务信息",
  },
  {
    to: "/construction",
    label: "施工管理",
    icon: ClipboardList,
    desc: "施工状态跟踪看板",
  },
  {
    to: "/maintenance",
    label: "保养周期",
    icon: CalendarDays,
    desc: "打蜡/镀晶/内饰清洗管理",
  },
  {
    to: "/members",
    label: "会员管理",
    icon: Users,
    desc: "会员开卡与充值续费",
  },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-navy-50/40">
      <aside className="flex w-64 shrink-0 flex-col border-r border-navy-100 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/30">
            <Car className="h-5 w-5 text-navy-900" />
          </div>
          <div>
            <div className="text-base font-bold tracking-wide">
              净车坊
              <span className="ml-1 text-gold-400">AutoSPA</span>
            </div>
            <div className="text-xs text-navy-200/70">汽车美容管理系统</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-gold-500/90 to-gold-400/90 text-navy-900 shadow-lg shadow-gold-500/30"
                      : "text-navy-100/80 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">
                    {item.label}
                  </div>
                  <div
                    className={`text-[11px] leading-tight mt-0.5 ${
                      location.pathname === item.to ||
                      (item.to === "/" && location.pathname === "/")
                        ? "text-navy-900/70"
                        : "text-navy-200/50"
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-navy-900">
              管
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">管理员</div>
              <div className="text-xs text-navy-200/60">前台接待账号</div>
            </div>
            <Sparkles className="h-4 w-4 text-gold-400" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-navy-100 bg-white/80 px-8 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold text-navy-900">
              {NAV_ITEMS.find(
                (n) =>
                  n.to === location.pathname ||
                  (n.to === "/" && location.pathname === "/")
              )?.label || "管理系统"}
            </h1>
            <p className="text-xs text-navy-500 -mt-0.5">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-navy-50 px-4 py-1.5 text-xs text-navy-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              营业中 · 数据实时同步
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
