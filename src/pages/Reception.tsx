import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Palette,
  Gauge,
  Hash,
  Check,
  Search,
  User,
  UserPlus,
  CreditCard,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/store";
import type { Member } from "@/types";
import { CAR_COLORS, CAR_MODELS, CARD_TYPE_COLOR, CARD_TYPE_TEXT } from "@/types";
import { formatCurrency, formatDuration, validatePlate, validatePhone, daysUntilExpiry } from "@/utils/format";

export default function Reception() {
  const navigate = useNavigate();
  const services = useAppStore((s) => s.services);
  const createOrder = useAppStore((s) => s.createOrder);
  const findMemberByPhone = useAppStore((s) => s.findMemberByPhone);
  const createMember = useAppStore((s) => s.createMember);

  const [plateNumber, setPlateNumber] = useState("");
  const [carModel, setCarModel] = useState(CAR_MODELS[0]);
  const [color, setColor] = useState(CAR_COLORS[0]);
  const [mileage, setMileage] = useState("");
  const [remark, setRemark] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [foundMember, setFoundMember] = useState<Member | undefined>(undefined);
  const [memberAssociated, setMemberAssociated] = useState<Member | undefined>(undefined);
  const [showNewMember, setShowNewMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCardType, setNewCardType] = useState<"times" | "monthly" | "yearly">("times");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSearchMember = () => {
    if (!validatePhone(searchPhone)) {
      setErrors((e) => ({ ...e, search: "请输入正确的手机号" }));
      setTimeout(() => setErrors((e) => ({ ...e, search: "" })), 2500);
      return;
    }
    setErrors((e) => ({ ...e, search: "" }));
    const m = findMemberByPhone(searchPhone);
    setFoundMember(m);
  };

  const handleCreateMember = () => {
    if (!validatePhone(newPhone)) {
      setErrors((e) => ({ ...e, phone: "请输入正确的手机号" }));
      return;
    }
    if (!newName.trim()) {
      setErrors((e) => ({ ...e, name: "请输入姓名" }));
      return;
    }
    setErrors({});
    const m = createMember({
      phone: newPhone.trim(),
      name: newName.trim(),
      cardType: newCardType,
    });
    setMemberAssociated(m);
    setShowNewMember(false);
    setNewName("");
    setNewPhone("");
  };

  const selectedServices = useMemo(
    () => services.filter((s) => selected.includes(s.id)),
    [services, selected]
  );

  const totals = useMemo(() => {
    const total = selectedServices.reduce((s, it) => s + it.price, 0);
    let discount = 0;
    if (memberAssociated?.cardType === "yearly") {
      const nonWash = selectedServices
        .filter((s) => s.id !== "S001")
        .reduce((s, it) => s + it.price, 0);
      discount = Math.round(nonWash * 0.1 * 100) / 100;
    }
    const duration = selectedServices.reduce((s, it) => s + it.duration, 0);
    return {
      total,
      discount,
      payable: Math.round((total - discount) * 100) / 100,
      duration,
    };
  }, [selectedServices, memberAssociated]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!validatePlate(plateNumber)) newErrors.plate = "请输入正确的车牌号";
    if (!mileage || Number(mileage) < 0) newErrors.mileage = "请输入正确的里程数";
    if (selected.length === 0) newErrors.services = "请至少选择一项服务";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors({}), 3000);
      return;
    }

    const order = createOrder({
      plateNumber,
      carModel,
      color,
      mileage: Number(mileage),
      selectedServiceIds: selected,
      memberId: memberAssociated?.id,
      remark: remark.trim() || undefined,
    });

    setPlateNumber("");
    setMileage("");
    setRemark("");
    setSelected([]);
    setMemberAssociated(undefined);
    setFoundMember(undefined);
    setSearchPhone("");

    navigate(`/construction?highlight=${order.id}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-navy-900">车辆信息</h2>
              <p className="text-xs text-navy-500 -mt-0.5">请准确录入接车信息</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                <Hash className="inline h-3.5 w-3.5 mr-1" />
                车牌号
              </label>
              <input
                className={`input-field font-bold tracking-wider ${
                  errors.plate ? "border-red-400 focus:ring-red-200/50 focus:border-red-400" : ""
                }`}
                placeholder="例如：京A88888"
                value={plateNumber}
                onChange={(e) =>
                  setPlateNumber(e.target.value.toUpperCase())
                }
                maxLength={8}
              />
              {errors.plate && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.plate}
                </p>
              )}
            </div>

            <div>
              <label className="label-field">
                <Car className="inline h-3.5 w-3.5 mr-1" />
                车型
              </label>
              <select
                className="input-field"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              >
                {CAR_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">
                <Palette className="inline h-3.5 w-3.5 mr-1" />
                颜色
              </label>
              <select
                className="input-field"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {CAR_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">
                <Gauge className="inline h-3.5 w-3.5 mr-1" />
                里程数 (km)
              </label>
              <input
                type="number"
                className={`input-field ${
                  errors.mileage ? "border-red-400 focus:ring-red-200/50 focus:border-red-400" : ""
                }`}
                placeholder="例如：35000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
              {errors.mileage && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.mileage}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label-field">备注（选填）</label>
              <textarea
                className="input-field min-h-[72px] resize-none"
                placeholder="客户特殊要求、车辆瑕疵记录等..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-navy-900">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900">选择服务项目</h2>
                <p className="text-xs text-navy-500 -mt-0.5">
                  可多选，会员自动享受对应折扣
                </p>
              </div>
            </div>
            <div className="text-xs text-navy-500">
              已选 <span className="font-bold text-navy-900">{selected.length}</span> 项
            </div>
          </div>

          {errors.services && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {errors.services}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => {
              const isSelected = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-navy-800 bg-navy-50 shadow-md"
                      : "border-navy-100 bg-white hover:border-navy-300 hover:bg-navy-50/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 text-white shadow">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className="pr-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-navy-900">{s.name}</h3>
                      <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                    </div>
                    <p className="text-xs text-navy-500 mt-1 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-navy-900">
                          {formatCurrency(s.price)}
                        </span>
                        <span className="text-xs text-navy-400 inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(s.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900">关联会员</h2>
                <p className="text-xs text-navy-500 -mt-0.5">可选，输入手机号查询</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewMember(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              新开卡
            </button>
          </div>

          {!memberAssociated && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                  <input
                    className="input-field pl-9"
                    placeholder="输入手机号查询会员"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
                    maxLength={11}
                  />
                </div>
                <button className="btn-secondary" onClick={handleSearchMember}>
                  查询
                </button>
              </div>
              {errors.search && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.search}
                </p>
              )}

              {foundMember && (
                <div
                  className={`rounded-xl p-4 border-2 ${
                    foundMember.cardType === "yearly"
                      ? "border-gold-300 bg-gold-50"
                      : foundMember.cardType === "monthly"
                      ? "border-violet-300 bg-violet-50"
                      : "border-sky-300 bg-sky-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm font-bold text-navy-900">
                        {foundMember.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-navy-900">
                          {foundMember.name}
                        </div>
                        <div className="text-xs text-navy-500">
                          {foundMember.phone}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`badge border ${CARD_TYPE_COLOR[foundMember.cardType]}`}
                    >
                      {CARD_TYPE_TEXT[foundMember.cardType]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {foundMember.cardType === "times" && (
                      <div className="col-span-2 rounded-lg bg-white/80 px-3 py-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-navy-500">剩余次数</span>
                          <span className="font-bold text-sky-700">
                            {foundMember.remainingTimes} / {foundMember.totalTimes}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-sky-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all"
                            style={{
                              width: `${(foundMember.remainingTimes / foundMember.totalTimes) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <div className="text-navy-500">有效期至</div>
                      <div className="font-semibold text-navy-900">
                        {foundMember.expiryDate}
                      </div>
                      <div className="text-[10px] text-navy-400">
                        剩 {daysUntilExpiry(foundMember.expiryDate)} 天
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2">
                      <div className="text-navy-500">储值余额</div>
                      <div className="font-semibold text-navy-900">
                        {formatCurrency(foundMember.balance)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMemberAssociated(foundMember)}
                    className="btn-primary w-full mt-3"
                  >
                    <Check className="h-4 w-4" />
                    关联此会员
                  </button>
                </div>
              )}

              {!foundMember && searchPhone.length === 11 && !errors.search && (
                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 text-center text-sm text-navy-600">
                  <div className="font-medium">未找到该会员</div>
                  <div className="text-xs text-navy-500 mt-1">
                    可点击右上角「新开卡」注册会员
                  </div>
                </div>
              )}
            </div>
          )}

          {memberAssociated && (
            <div
              className={`rounded-xl p-4 border-2 ${
                memberAssociated.cardType === "yearly"
                  ? "border-gold-300 bg-gold-50"
                  : memberAssociated.cardType === "monthly"
                  ? "border-violet-300 bg-violet-50"
                  : "border-sky-300 bg-sky-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm font-bold text-navy-900">
                    {memberAssociated.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">
                        {memberAssociated.name}
                      </span>
                      <span
                        className={`badge border ${CARD_TYPE_COLOR[memberAssociated.cardType]}`}
                      >
                        {CARD_TYPE_TEXT[memberAssociated.cardType]}
                      </span>
                    </div>
                    <div className="text-xs text-navy-500">
                      {memberAssociated.phone}
                      {memberAssociated.cardType === "times" && (
                        <span className="ml-2 text-sky-700 font-semibold">
                          剩 {memberAssociated.remainingTimes} 次
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMemberAssociated(undefined)}
                  className="text-xs text-navy-400 hover:text-red-500 transition-colors"
                >
                  解除
                </button>
              </div>
              {memberAssociated.cardType === "yearly" && (
                <div className="mt-2 rounded-lg bg-white/80 px-3 py-1.5 text-xs text-gold-700 inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  年卡专享：其他服务9折优惠
                </div>
              )}
            </div>
          )}

          {showNewMember && (
            <div className="mt-4 rounded-xl border-2 border-navy-200 bg-navy-50/60 p-4 space-y-3">
              <div className="font-semibold text-navy-900 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> 新增会员
              </div>
              <div>
                <label className="label-field text-xs">姓名</label>
                <input
                  className="input-field text-sm"
                  placeholder="请输入姓名"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="label-field text-xs">手机号</label>
                <input
                  className="input-field text-sm"
                  placeholder="请输入11位手机号"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={11}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="label-field text-xs">卡类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["times", "monthly", "yearly"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewCardType(t)}
                      className={`rounded-lg border-2 p-2 text-xs font-medium transition-all ${
                        newCardType === t
                          ? "border-navy-800 bg-navy-800 text-white"
                          : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
                      }`}
                    >
                      {CARD_TYPE_TEXT[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-navy-500 px-1">
                <div>¥300 · 10次 · 1年</div>
                <div>¥199 · 30天</div>
                <div>¥1999 · 365天</div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setShowNewMember(false)}
                >
                  取消
                </button>
                <button className="btn-primary flex-1" onClick={handleCreateMember}>
                  确认开卡
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 border-2 border-navy-800 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white sticky top-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gold-400" />
            订单汇总
          </h2>

          {selected.length === 0 ? (
            <div className="py-8 text-center text-white/50 text-sm">
              尚未选择服务项目
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1.5">
                {selectedServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-white/10 last:border-0"
                  >
                    <span className="text-white/80">{s.name}</span>
                    <span className="font-medium">
                      {formatCurrency(s.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm pt-2 text-white/60">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 预计耗时
                </span>
                <span className="font-medium text-white">
                  {formatDuration(totals.duration)}
                </span>
              </div>

              {totals.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-300 inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> 会员折扣
                  </span>
                  <span className="font-semibold text-emerald-300">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
              )}

              <div className="rounded-xl bg-white/10 p-4 mt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-white/70 text-sm">应付金额</span>
                  <span className="text-3xl font-bold tracking-tight text-gold-400">
                    {formatCurrency(totals.payable)}
                  </span>
                </div>
                {totals.total !== totals.payable && (
                  <div className="text-right text-xs text-white/40 line-through mt-0.5">
                    原价 {formatCurrency(totals.total)}
                  </div>
                )}
              </div>

              <button
                className="btn-gold w-full mt-2 py-3 text-base"
                onClick={handleSubmit}
              >
                <Sparkles className="h-5 w-5" />
                确认开单并进入施工
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
