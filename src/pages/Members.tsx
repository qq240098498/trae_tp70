import { useState } from "react";
import {
  Users,
  CreditCard,
  Calendar,
  Search,
  PlusCircle,
  CalendarClock,
  Wallet,
  Ticket,
  RefreshCcw,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/store";
import type { Member, CardType } from "@/types";
import { CARD_TYPE_COLOR, CARD_TYPE_TEXT } from "@/types";
import {
  formatCurrency,
  daysUntilExpiry,
  validatePhone,
} from "@/utils/format";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const CARD_PRICING: Record<CardType, number> = {
  times: 300,
  monthly: 199,
  yearly: 1999,
};

export default function Members() {
  const members = useAppStore((s) => s.members);
  const createMember = useAppStore((s) => s.createMember);
  const rechargeMemberTimes = useAppStore((s) => s.rechargeMemberTimes);
  const renewMember = useAppStore((s) => s.renewMember);

  const [keyword, setKeyword] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addCard, setAddCard] = useState<CardType>("times");
  const [addErr, setAddErr] = useState("");

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeTimes, setRechargeTimes] = useState(10);
  const [renewCard, setRenewCard] = useState<CardType>("times");

  const filtered = members.filter(
    (m) =>
      !keyword.trim() ||
      m.name.includes(keyword) ||
      m.phone.includes(keyword)
  );

  const stats = {
    total: members.length,
    times: members.filter((m) => m.cardType === "times").length,
    monthly: members.filter((m) => m.cardType === "monthly").length,
    yearly: members.filter((m) => m.cardType === "yearly").length,
  };

  const handleCreate = () => {
    if (!addName.trim()) return setAddErr("请输入姓名");
    if (!validatePhone(addPhone)) return setAddErr("请输入正确的手机号");
    if (members.find((m) => m.phone === addPhone.trim()))
      return setAddErr("该手机号已注册");
    setAddErr("");
    createMember({
      name: addName.trim(),
      phone: addPhone.trim(),
      cardType: addCard,
    });
    setShowAdd(false);
    setAddName("");
    setAddPhone("");
    setAddCard("times");
  };

  const handleRecharge = () => {
    if (!editMember) return;
    rechargeMemberTimes(editMember.id, rechargeTimes);
    setShowRecharge(false);
    setEditMember(null);
    setRechargeTimes(10);
  };

  const handleRenew = () => {
    if (!editMember) return;
    renewMember(editMember.id, renewCard);
    setShowRecharge(false);
    setEditMember(null);
  };

  const openRecharge = (m: Member) => {
    setEditMember(m);
    setRenewCard(m.cardType);
    if (m.cardType === "times") {
      setRechargeTimes(10);
    }
    setShowRecharge(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "会员总数",
            value: stats.total,
            icon: Users,
            gradient: "from-navy-800 to-navy-900",
            iconBg: "bg-gold-400 text-navy-900",
          },
          {
            label: "次卡会员",
            value: stats.times,
            icon: Ticket,
            gradient: "from-sky-500 to-sky-700",
            iconBg: "bg-white/25 text-white",
          },
          {
            label: "月卡会员",
            value: stats.monthly,
            icon: Calendar,
            gradient: "from-violet-500 to-violet-700",
            iconBg: "bg-white/25 text-white",
          },
          {
            label: "年卡会员",
            value: stats.yearly,
            icon: CalendarClock,
            gradient: "from-gold-500 to-gold-700",
            iconBg: "bg-white/25 text-white",
          },
        ].map((it, idx) => {
          const Icon = it.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${it.gradient} relative overflow-hidden`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
              <div className="relative">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${it.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm text-white/80">{it.label}</div>
                <div className="mt-1 text-3xl font-bold">{it.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
            <input
              className="input-field pl-9"
              placeholder="搜索会员姓名或手机号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <PlusCircle className="h-4 w-4" />
            新开会员
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-50/70 text-left text-xs font-semibold text-navy-600">
                <th className="px-4 py-3">会员信息</th>
                <th className="px-4 py-3">卡类型</th>
                <th className="px-4 py-3">剩余次数 / 余额</th>
                <th className="px-4 py-3">有效期</th>
                <th className="px-4 py-3">开卡时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-navy-400 text-sm">
                    暂无会员数据
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const days = daysUntilExpiry(m.expiryDate);
                  const expired = days < 0;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-navy-50/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900">
                              {m.name}
                            </div>
                            <div className="text-xs text-navy-500">
                              {m.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`badge border ${CARD_TYPE_COLOR[m.cardType]}`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {CARD_TYPE_TEXT[m.cardType]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {m.cardType === "times" ? (
                          <div className="min-w-[160px]">
                            <div className="flex items-center justify-between mb-1.5 text-xs">
                              <span className="text-navy-500">
                                剩余 {m.remainingTimes}/{m.totalTimes}次
                              </span>
                              <span className="font-semibold text-sky-700">
                                {Math.round(
                                  (m.remainingTimes / m.totalTimes) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-sky-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  m.remainingTimes / m.totalTimes < 0.3
                                    ? "bg-red-500"
                                    : "bg-sky-500"
                                }`}
                                style={{
                                  width: `${Math.max(
                                    4,
                                    (m.remainingTimes / m.totalTimes) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Wallet className="h-4 w-4 text-navy-400" />
                            <span className="font-semibold text-navy-900">
                              {formatCurrency(m.balance)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-navy-900">
                            {m.expiryDate}
                          </div>
                          {expired ? (
                            <div className="text-xs text-red-600 inline-flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3" />
                              已过期 {Math.abs(days)} 天
                            </div>
                          ) : days < 7 ? (
                            <div className="text-xs text-amber-600 inline-flex items-center gap-1 mt-0.5 font-medium">
                              <AlertCircle className="h-3 w-3" />
                              剩 {days} 天到期
                            </div>
                          ) : (
                            <div className="text-xs text-navy-500 mt-0.5">
                              剩 {days} 天
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-navy-600">
                        {new Date(m.createdAt).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openRecharge(m)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700 hover:bg-gold-100 transition-colors"
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                          {m.cardType === "times" ? "充值次数" : "续费"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增会员">
        <div className="space-y-4">
          <div>
            <label className="label-field">姓名</label>
            <input
              className="input-field"
              placeholder="请输入车主姓名"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">手机号</label>
            <input
              className="input-field"
              placeholder="请输入11位手机号"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={11}
            />
          </div>
          <div>
            <label className="label-field">选择卡类型</label>
            <div className="grid grid-cols-3 gap-2">
              {(["times", "monthly", "yearly"] as CardType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddCard(t)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    addCard === t
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-navy-100 bg-white text-navy-700 hover:border-navy-200"
                  }`}
                >
                  <div className="font-bold text-sm">
                    {CARD_TYPE_TEXT[t]}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      addCard === t ? "text-gold-300" : "text-navy-400"
                    }`}
                  >
                    {formatCurrency(CARD_PRICING[t])}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-navy-50 p-3 text-xs text-navy-600 leading-relaxed">
              {addCard === "times" && "10次普洗 · 有效期1年 · 用完自动按次扣减"}
              {addCard === "monthly" && "30天内普洗不限次数 · 其他服务按原价"}
              {addCard === "yearly" && "365天普洗不限次 · 其他服务专享9折优惠"}
            </div>
          </div>
          {addErr && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {addErr}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setShowAdd(false)}>
              取消
            </button>
            <button className="btn-primary flex-1" onClick={handleCreate}>
              <Check className="h-4 w-4" />
              确认开卡
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showRecharge}
        onClose={() => {
          setShowRecharge(false);
          setEditMember(null);
        }}
        title={
          editMember
            ? `${editMember.name} - ${editMember.cardType === "times" ? "充值次数" : "续费"}`
            : ""
        }
      >
        {editMember && (
          <div className="space-y-4">
            <div className="rounded-xl bg-navy-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-navy-500">当前状态</span>
                <span className={`badge border ${CARD_TYPE_COLOR[editMember.cardType]}`}>
                  {CARD_TYPE_TEXT[editMember.cardType]}
                </span>
              </div>
              {editMember.cardType === "times" && (
                <div className="text-sm text-navy-700">
                  剩余次数：
                  <span className="font-bold text-sky-700">
                    {editMember.remainingTimes}
                  </span>{" "}
                  / {editMember.totalTimes}
                </div>
              )}
              <div className="text-sm text-navy-700 mt-1">
                有效期至：
                <span className="font-semibold">{editMember.expiryDate}</span>
              </div>
            </div>

            {editMember.cardType === "times" ? (
              <div>
                <label className="label-field">充值次数</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[5, 10, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRechargeTimes(n)}
                      className={`rounded-lg border-2 p-2 text-sm font-semibold transition-all ${
                        rechargeTimes === n
                          ? "border-navy-800 bg-navy-800 text-white"
                          : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
                      }`}
                    >
                      {n} 次
                    </button>
                  ))}
                </div>
                <div className="rounded-xl bg-gold-50 border border-gold-200 p-3 text-sm">
                  <div className="flex justify-between text-navy-700">
                    <span>应付金额（30元/次）</span>
                    <span className="font-bold text-gold-700">
                      {formatCurrency(rechargeTimes * 30)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="label-field">续费类型</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["times", "monthly", "yearly"] as CardType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setRenewCard(t)}
                      className={`rounded-lg border-2 p-2 text-xs font-semibold transition-all ${
                        renewCard === t
                          ? "border-navy-800 bg-navy-800 text-white"
                          : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
                      }`}
                    >
                      {CARD_TYPE_TEXT[t]}
                      <div
                        className={`mt-0.5 ${
                          renewCard === t ? "text-gold-300" : "text-navy-400"
                        }`}
                      >
                        {formatCurrency(CARD_PRICING[t])}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl bg-gold-50 border border-gold-200 p-3 text-sm">
                  <div className="flex justify-between text-navy-700">
                    <span>
                      {CARD_TYPE_TEXT[renewCard]}续费
                    </span>
                    <span className="font-bold text-gold-700">
                      {formatCurrency(CARD_PRICING[renewCard])}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setShowRecharge(false);
                  setEditMember(null);
                }}
              >
                取消
              </button>
              <button
                className="btn-primary flex-1"
                onClick={
                  editMember.cardType === "times" ? handleRecharge : handleRenew
                }
              >
                <Check className="h-4 w-4" />
                确认
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
