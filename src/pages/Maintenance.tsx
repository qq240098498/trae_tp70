import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  Sofa,
  Wallet,
  AlertTriangle,
  Trash2,
  Save,
  X,
  Send,
  CheckCircle2,
  BellRing,
  Gift,
  Info,
  User,
  Search,
  Filter,
} from "lucide-react";
import { useAppStore } from "@/store";
import { formatCurrency } from "@/utils/format";
import {
  type MaintenanceRecord,
  type MaintenanceType,
  MAINTENANCE_TEXT,
  MAINTENANCE_CYCLE_DAYS,
  MAINTENANCE_PRICE,
} from "@/types";

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
              {[
                { key: "wax" as const, label: "打蜡", Icon: Sparkles, price: MAINTENANCE_PRICE.wax },
                { key: "coating" as const, label: "镀晶", Icon: ShieldCheck, price: MAINTENANCE_PRICE.coating },
                { key: "interior_clean" as const, label: "内饰清洗", Icon: Sofa, price: MAINTENANCE_PRICE.interior_clean },
              ].map((opt) => {
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
      className={`rounded-xl border-2 p-4 ${
        isUrgent
          ? "border-rose-200 bg-gradient-to-r from-rose-50 to-white"
          : "border-orange-200 bg-gradient-to-r from-orange-50 to-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-bold text-navy-900 text-base">{record.plateNumber}</span>
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
            <div className="flex items-center gap-2 text-xs text-navy-500 mb-1">
              <User className="h-3 w-3" />
              <span>
                {record.memberName}
                {record.memberPhone ? ` · ${record.memberPhone}` : ""}
              </span>
            </div>
          )}
          {member && (
            <div className="flex items-center gap-1 text-xs mb-1">
              <Wallet className="h-3 w-3 text-emerald-500" />
              <span className="text-navy-500">会员余额：</span>
              <span className={`font-semibold ${balance > 0 ? "text-emerald-600" : "text-navy-400"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          )}
          <div className="text-[11px] text-navy-400">
            上次服务：{record.serviceDate} · 到期日：{record.nextDueDate}
          </div>
          <div className="mt-2 p-2 rounded-lg bg-white/60 border border-navy-100">
            <div className="text-xs text-navy-600 font-medium mb-1">💡 推送提醒内容预览：</div>
            <div className="text-[11px] text-navy-500 leading-relaxed">
              尊敬的{record.memberName || "客户"}，您的{record.plateNumber}
              车辆{MAINTENANCE_TEXT[record.type]}保养
              {status.status === "overdue" ? `已超期${Math.abs(status.daysLeft)}天` : `将于${status.daysLeft}天后到期`}，
              {member ? `当前会员余额${formatCurrency(balance)}，` : ""}
              请及时安排保养。
            </div>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {!record.reminderIssued ? (
            <button
              onClick={() => onIssue(record.id)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors ${
                isUrgent
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              推送提醒
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已推送
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const maintenanceRecords = useAppStore((s) => s.maintenanceRecords);
  const members = useAppStore((s) => s.members);
  const deleteMaintenanceRecord = useAppStore((s) => s.deleteMaintenanceRecord);
  const issueMaintenanceReminder = useAppStore((s) => s.issueMaintenanceReminder);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "reminders" | "wax" | "coating" | "interior_clean">("all");
  const [searchPlate, setSearchPlate] = useState("");

  const stats = useMemo(() => {
    const total = maintenanceRecords.length;
    const waxCount = maintenanceRecords.filter((r) => r.type === "wax").length;
    const coatingCount = maintenanceRecords.filter((r) => r.type === "coating").length;
    const interiorCount = maintenanceRecords.filter((r) => r.type === "interior_clean").length;
    const dueSoon = maintenanceRecords.filter((r) => {
      const st = getMaintenanceStatus(r.nextDueDate);
      return st.status !== "ok";
    }).length;
    const overdue = maintenanceRecords.filter((r) => {
      const st = getMaintenanceStatus(r.nextDueDate);
      return st.status === "overdue";
    }).length;
    const pendingReminders = maintenanceRecords.filter((r) => {
      const st = getMaintenanceStatus(r.nextDueDate);
      return st.status !== "ok" && !r.reminderIssued;
    }).length;
    return { total, waxCount, coatingCount, interiorCount, dueSoon, overdue, pendingReminders };
  }, [maintenanceRecords]);

  const filteredRecords = useMemo(() => {
    let records = [...maintenanceRecords];
    if (activeTab === "reminders") {
      records = records.filter((r) => {
        const st = getMaintenanceStatus(r.nextDueDate);
        return st.status !== "ok";
      });
    } else if (activeTab !== "all") {
      records = records.filter((r) => r.type === activeTab);
    }
    if (searchPlate.trim()) {
      const plate = searchPlate.toUpperCase().trim();
      records = records.filter((r) => r.plateNumber.includes(plate));
    }
    return records.sort((a, b) => {
      const sa = getMaintenanceStatus(a.nextDueDate);
      const sb = getMaintenanceStatus(b.nextDueDate);
      return sa.daysLeft - sb.daysLeft;
    });
  }, [maintenanceRecords, activeTab, searchPlate]);

  const handleIssueAll = () => {
    filteredRecords.forEach((r) => {
      const st = getMaintenanceStatus(r.nextDueDate);
      if (st.status !== "ok" && !r.reminderIssued) {
        issueMaintenanceReminder(r.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-600" />
            保养周期管理
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            打蜡/镀晶/内饰清洗记录管理 · 到期前7天自动提醒
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-navy-700 to-navy-900 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
        >
          <PlusCircle className="h-4 w-4" />
          录入保养记录
        </button>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-navy-900">{stats.total}</div>
          <div className="text-xs text-navy-500 mt-1">总记录</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.waxCount}</div>
          <div className="text-xs text-navy-500 mt-1">打蜡</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.coatingCount}</div>
          <div className="text-xs text-navy-500 mt-1">镀晶</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.interiorCount}</div>
          <div className="text-xs text-navy-500 mt-1">内饰清洗</div>
        </div>
        <div className="card p-4 text-center bg-orange-50/50">
          <div className="text-2xl font-bold text-orange-600">{stats.dueSoon}</div>
          <div className="text-xs text-navy-500 mt-1">即将到期</div>
        </div>
        <div className="card p-4 text-center bg-rose-50/50">
          <div className="text-2xl font-bold text-rose-600">{stats.overdue}</div>
          <div className="text-xs text-navy-500 mt-1">已超期</div>
        </div>
      </section>

      {stats.dueSoon > 0 && (
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-orange-50/50 to-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-orange-800">保养周期提醒</div>
                <div className="text-xs text-orange-600">
                  到期前7天自动提醒 · 共 {stats.dueSoon} 项待关注
                  {stats.pendingReminders > 0 && `，${stats.pendingReminders} 项待推送`}
                </div>
              </div>
            </div>
            {stats.pendingReminders > 0 && (
              <button
                onClick={handleIssueAll}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:from-orange-600 hover:to-indigo-600 transition-colors"
              >
                <Gift className="h-3.5 w-3.5" />
                一键推送全部 ({stats.pendingReminders})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {maintenanceRecords
              .filter((r) => {
                const st = getMaintenanceStatus(r.nextDueDate);
                return st.status !== "ok";
              })
              .sort((a, b) => {
                const sa = getMaintenanceStatus(a.nextDueDate);
                const sb = getMaintenanceStatus(b.nextDueDate);
                return sa.daysLeft - sb.daysLeft;
              })
              .slice(0, 5)
              .map((r) => (
                <MaintenanceReminderCard
                  key={r.id}
                  record={r}
                  onIssue={issueMaintenanceReminder}
                />
              ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-navy-400" />
            {[
              { key: "all" as const, label: "全部" },
              { key: "reminders" as const, label: "待提醒" },
              { key: "wax" as const, label: "打蜡" },
              { key: "coating" as const, label: "镀晶" },
              { key: "interior_clean" as const, label: "内饰清洗" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-navy-800 text-white"
                    : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 sm:max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
            <input
              className="input-field pl-9 text-sm"
              placeholder="输入车牌号搜索..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy-50 mb-4">
              <CalendarDays className="h-10 w-10 text-navy-300" />
            </div>
            <p className="text-sm text-navy-400 mb-4">
              {searchPlate || activeTab !== "all" ? "没有找到匹配的保养记录" : "暂无保养记录"}
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              立即录入第一条记录
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((r) => {
              const status = getMaintenanceStatus(r.nextDueDate);
              const Icon = MaintenanceIconMap[r.type];
              const colors = MaintenanceColorMap[r.type];
              const member = r.memberId ? members.find((m) => m.id === r.memberId) : undefined;
              const balance = member?.balance ?? 0;

              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-navy-100 bg-gradient-to-r from-white to-navy-50/30 p-4 relative group"
                >
                  <button
                    onClick={() => {
                      if (confirm(`确认删除 ${r.plateNumber} 的${MAINTENANCE_TEXT[r.type]}记录？`)) {
                        deleteMaintenanceRecord(r.id);
                      }
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded-md hover:bg-rose-50 text-navy-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="pr-6">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-navy-900">{r.plateNumber}</span>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
                      >
                        <Icon className="h-3 w-3 mr-0.5" />
                        {MAINTENANCE_TEXT[r.type]}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-navy-500">服务日期</span>
                        <span className="font-medium text-navy-700">{r.serviceDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy-500">下次到期</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${status.color}`}
                        >
                          {r.nextDueDate} · {status.label}
                        </span>
                      </div>
                      {r.memberName && (
                        <div className="flex justify-between">
                          <span className="text-navy-500">会员</span>
                          <span className="font-medium text-navy-700">{r.memberName}</span>
                        </div>
                      )}
                      {member && (
                        <div className="flex justify-between">
                          <span className="text-navy-500 flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> 会员余额
                          </span>
                          <span className={`font-semibold ${balance > 0 ? "text-emerald-600" : "text-navy-400"}`}>
                            {formatCurrency(balance)}
                          </span>
                        </div>
                      )}
                      {r.reminderIssued && r.reminderIssuedAt && (
                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 pt-1 border-t border-navy-100">
                          <CheckCircle2 className="h-3 w-3" />
                          提醒已推送 · {new Date(r.reminderIssuedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MaintenanceAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
