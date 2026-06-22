import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CardType,
  Coupon,
  CouponStatus,
  MaintenanceRecord,
  MaintenanceType,
  Member,
  Order,
  OrderService,
  OrderStatus,
  PaymentMethod,
  Service,
  WeatherCondition,
  WeatherLog,
} from "@/types";
import { MAINTENANCE_CYCLE_DAYS } from "@/types";

const DEFAULT_SERVICES: Service[] = [
  {
    id: "S001",
    name: "普洗",
    price: 35,
    duration: 15,
    category: "基础清洗",
    description: "车身外部高压水枪冲洗 + 泡沫清洁 + 轮毂清洗 + 内饰简单吸尘",
  },
  {
    id: "S002",
    name: "精洗",
    price: 88,
    duration: 45,
    category: "基础清洗",
    description: "包含普洗全部项目 + 门边胶条清洁 + 仪表盘上光 + 玻璃镀膜",
  },
  {
    id: "S003",
    name: "打蜡",
    price: 168,
    duration: 60,
    category: "美容养护",
    description: "精洗 + 漆面去污 + 棕榈蜡上光 + 轮胎上光",
  },
  {
    id: "S004",
    name: "镀晶",
    price: 1280,
    duration: 240,
    category: "美容养护",
    description: "精洗 + 漆面氧化层处理 + 抛光还原 + 纳米镀晶施工(质保1年)",
  },
  {
    id: "S005",
    name: "内饰清洗",
    price: 258,
    duration: 90,
    category: "清洁养护",
    description: "顶棚 + 座椅 + 地毯 + 门板深度清洗 + 真皮保养 + 臭氧消毒",
  },
  {
    id: "S006",
    name: "发动机舱清洗",
    price: 128,
    duration: 30,
    category: "清洁养护",
    description: "专业脱脂剂清洁 + 线路保护剂上光 + 塑料件翻新",
  },
  {
    id: "S007",
    name: "贴膜（车窗）",
    price: 880,
    duration: 180,
    category: "装饰服务",
    description: "高隔热防晒膜 + 四门窗+后挡施工 + 质保3年",
  },
];

const genId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const addDays = (d: Date, days: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd.toISOString().slice(0, 10);
};

const now = new Date();
const todayStr = now.toISOString();

const DEMO_MEMBERS: Member[] = [
  {
    id: "M001",
    phone: "13800138001",
    name: "张先生",
    cardType: "times",
    remainingTimes: 7,
    totalTimes: 10,
    expiryDate: addDays(now, 300),
    balance: 0,
    createdAt: new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "M002",
    phone: "13900139002",
    name: "李女士",
    cardType: "monthly",
    remainingTimes: 0,
    totalTimes: 0,
    expiryDate: addDays(now, 20),
    balance: 0,
    createdAt: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "M003",
    phone: "13700137003",
    name: "王总",
    cardType: "yearly",
    remainingTimes: 0,
    totalTimes: 0,
    expiryDate: addDays(now, 320),
    balance: 880,
    createdAt: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString(),
  },
];

const mkSvc = (s: Service, qty = 1): OrderService => ({
  id: genId("OS"),
  serviceId: s.id,
  serviceName: s.name,
  unitPrice: s.price,
  quantity: qty,
});

const DEMO_ORDERS: Order[] = [
  {
    id: "O001",
    plateNumber: "京A88888",
    carModel: "轿车",
    color: "黑色",
    mileage: 38520,
    memberId: "M001",
    memberName: "张先生",
    memberCardType: "times",
    services: [mkSvc(DEFAULT_SERVICES[0])],
    status: "pending",
    notified: false,
    totalAmount: 35,
    discountAmount: 0,
    payableAmount: 35,
    paid: false,
    createdAt: todayStr,
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: "O002",
    plateNumber: "沪B66666",
    carModel: "SUV",
    color: "白色",
    mileage: 62180,
    memberId: "M003",
    memberName: "王总",
    memberCardType: "yearly",
    services: [mkSvc(DEFAULT_SERVICES[2]), mkSvc(DEFAULT_SERVICES[5])],
    status: "in_progress",
    notified: false,
    totalAmount: 296,
    discountAmount: 12.8,
    payableAmount: 283.2,
    paid: false,
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    startedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: "O003",
    plateNumber: "粤C12345",
    carModel: "MPV",
    color: "银色",
    mileage: 105600,
    status: "completed",
    notified: false,
    services: [mkSvc(DEFAULT_SERVICES[1]), mkSvc(DEFAULT_SERVICES[4])],
    totalAmount: 346,
    discountAmount: 0,
    payableAmount: 346,
    paid: false,
    createdAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
    startedAt: new Date(now.getTime() - 80 * 60 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: "O004",
    plateNumber: "京A11111",
    carModel: "轿车",
    color: "白色",
    mileage: 15200,
    memberId: "M002",
    memberName: "李女士",
    memberCardType: "monthly",
    services: [mkSvc(DEFAULT_SERVICES[0])],
    status: "picked_up",
    notified: true,
    totalAmount: 35,
    discountAmount: 0,
    payableAmount: 35,
    paid: true,
    paymentMethod: "wechat",
    createdAt: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    startedAt: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 24.5 * 3600 * 1000).toISOString(),
    pickedUpAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    beforePhotos: [],
    afterPhotos: [],
  },
  {
    id: "O005",
    plateNumber: "京A22222",
    carModel: "SUV",
    color: "黑色",
    mileage: 42000,
    status: "picked_up",
    notified: true,
    services: [mkSvc(DEFAULT_SERVICES[1])],
    totalAmount: 88,
    discountAmount: 0,
    payableAmount: 88,
    paid: true,
    paymentMethod: "cash",
    createdAt: new Date(now.getTime() - 30 * 3600 * 1000).toISOString(),
    startedAt: new Date(now.getTime() - 29 * 3600 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
    pickedUpAt: new Date(now.getTime() - 27.5 * 3600 * 1000).toISOString(),
    beforePhotos: [],
    afterPhotos: [],
  },
];

const yesterdayStr = addDays(now, -1);
const todayDateStr = addDays(now, 0);
const tomorrowStr = addDays(now, 1);

const DEMO_WEATHER_LOGS: WeatherLog[] = [
  {
    date: yesterdayStr,
    condition: "sunny",
    temperature: 28,
    description: "昨日晴好，适宜洗车",
    recordedAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
  },
  {
    date: todayDateStr,
    condition: "rainy",
    temperature: 22,
    description: "今日有小雨，洗车顾客可享雨后复洗半价",
    recordedAt: todayStr,
  },
  {
    date: tomorrowStr,
    condition: "cloudy",
    temperature: 25,
    description: "明日多云转晴",
    recordedAt: todayStr,
  },
];

const DEMO_COUPONS: Coupon[] = [
  {
    id: "C001",
    type: "rain_rewash_half",
    name: "雨后复洗半价券",
    description: "昨日洗车今日遇雨，凭券享受精洗/普洗半价优惠",
    discount: 50,
    discountType: "percent",
    orderId: "O004",
    plateNumber: "京A11111",
    memberId: "M002",
    memberName: "李女士",
    memberPhone: "13900139002",
    status: "pending",
    rainDate: todayDateStr,
    washDate: yesterdayStr,
    expiresAt: addDays(now, 7),
    createdAt: todayStr,
  },
  {
    id: "C002",
    type: "rain_rewash_half",
    name: "雨后复洗半价券",
    description: "昨日洗车今日遇雨，凭券享受精洗/普洗半价优惠",
    discount: 50,
    discountType: "percent",
    orderId: "O005",
    plateNumber: "京A22222",
    status: "pending",
    rainDate: todayDateStr,
    washDate: yesterdayStr,
    expiresAt: addDays(now, 7),
    createdAt: todayStr,
  },
];

const DEMO_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: "MA001",
    plateNumber: "京A88888",
    type: "wax",
    serviceDate: addDays(now, -55),
    nextDueDate: addDays(now, 5),
    memberId: "M001",
    memberName: "张先生",
    memberPhone: "13800138001",
    createdAt: new Date(now.getTime() - 55 * 24 * 3600 * 1000).toISOString(),
    reminderIssued: false,
  },
  {
    id: "MA002",
    plateNumber: "沪B66666",
    type: "coating",
    serviceDate: addDays(now, -300),
    nextDueDate: addDays(now, 65),
    memberId: "M003",
    memberName: "王总",
    memberPhone: "13700137003",
    createdAt: new Date(now.getTime() - 300 * 24 * 3600 * 1000).toISOString(),
    reminderIssued: false,
  },
  {
    id: "MA003",
    plateNumber: "粤C12345",
    type: "interior_clean",
    serviceDate: addDays(now, -88),
    nextDueDate: addDays(now, 2),
    createdAt: new Date(now.getTime() - 88 * 24 * 3600 * 1000).toISOString(),
    reminderIssued: false,
  },
  {
    id: "MA004",
    plateNumber: "京A11111",
    type: "wax",
    serviceDate: addDays(now, -65),
    nextDueDate: addDays(now, -5),
    memberId: "M002",
    memberName: "李女士",
    memberPhone: "13900139002",
    createdAt: new Date(now.getTime() - 65 * 24 * 3600 * 1000).toISOString(),
    reminderIssued: true,
    reminderIssuedAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export interface AppStore {
  services: Service[];
  members: Member[];
  orders: Order[];
  coupons: Coupon[];
  weatherLogs: WeatherLog[];
  maintenanceRecords: MaintenanceRecord[];

  createOrder: (input: {
    plateNumber: string;
    carModel: string;
    color: string;
    mileage: number;
    selectedServiceIds: string[];
    memberId?: string;
    remark?: string;
  }) => Order;

  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markNotified: (orderId: string) => void;

  payOrder: (orderId: string, method: PaymentMethod) => void;

  createMember: (input: {
    phone: string;
    name: string;
    cardType: CardType;
  }) => Member;
  rechargeMemberTimes: (memberId: string, times: number) => void;
  renewMember: (memberId: string, cardType: CardType) => void;

  findMemberByPhone: (phone: string) => Member | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getTodayStats: () => {
    revenue: number;
    inProgress: number;
    toPickup: number;
    totalMembers: number;
  };

  addPhotos: (orderId: string, stage: "before" | "after", photos: string[]) => void;
  removePhoto: (orderId: string, stage: "before" | "after", index: number) => void;

  recordWeather: (date: string, condition: WeatherCondition, temperature?: number, description?: string) => void;
  getTodayWeather: () => WeatherLog | undefined;
  getWeatherByDate: (date: string) => WeatherLog | undefined;
  isRainyDay: (date: string) => boolean;

  scanAndCreateRainCoupons: () => Coupon[];
  issueCoupon: (couponId: string) => void;
  useCoupon: (couponId: string) => void;
  getPendingCoupons: () => Coupon[];
  getCouponsByPlate: (plateNumber: string) => Coupon[];

  addMaintenanceRecord: (input: {
    plateNumber: string;
    type: MaintenanceType;
    serviceDate: string;
    memberId?: string;
  }) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  getMaintenanceByPlate: (plateNumber: string) => MaintenanceRecord[];
  getMaintenanceReminders: () => MaintenanceRecord[];
  issueMaintenanceReminder: (id: string) => void;
  getMemberBalance: (memberId: string) => number;
}

const calcDiscount = (
  services: OrderService[],
  member?: Member
): { discount: number; payable: number; total: number } => {
  const total = services.reduce(
    (s, it) => s + it.unitPrice * it.quantity,
    0
  );
  let discount = 0;
  if (member) {
    if (member.cardType === "yearly") {
      const nonWash = services
        .filter((s) => s.serviceId !== "S001")
        .reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      discount = nonWash * 0.1;
    }
  }
  return { discount: Math.round(discount * 100) / 100, total, payable: Math.round((total - discount) * 100) / 100 };
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,
      members: DEMO_MEMBERS,
      orders: DEMO_ORDERS,
      coupons: DEMO_COUPONS,
      weatherLogs: DEMO_WEATHER_LOGS,
      maintenanceRecords: DEMO_MAINTENANCE,

      createOrder: ({
        plateNumber,
        carModel,
        color,
        mileage,
        selectedServiceIds,
        memberId,
        remark,
      }) => {
        const { services, members } = get();
        const orderServices: OrderService[] = selectedServiceIds
          .map((sid) => services.find((s) => s.id === sid))
          .filter((s): s is Service => !!s)
          .map((s) => mkSvc(s));

        const member = memberId ? members.find((m) => m.id === memberId) : undefined;
        const { total, discount, payable } = calcDiscount(orderServices, member);

        const order: Order = {
          id: genId("O"),
          plateNumber: plateNumber.toUpperCase().trim(),
          carModel,
          color,
          mileage: Number(mileage) || 0,
          memberId: member?.id,
          memberName: member?.name,
          memberCardType: member?.cardType,
          services: orderServices,
          status: "pending",
          notified: false,
          totalAmount: total,
          discountAmount: discount,
          payableAmount: payable,
          paid: false,
          createdAt: new Date().toISOString(),
          remark,
          beforePhotos: [],
          afterPhotos: [],
        };

        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },

      updateOrderStatus: (orderId, status) => {
        const now = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  startedAt: status === "in_progress" && !o.startedAt ? now : o.startedAt,
                  completedAt: status === "completed" ? now : o.completedAt,
                  pickedUpAt: status === "picked_up" ? now : o.pickedUpAt,
                }
              : o
          ),
        }));
      },

      markNotified: (orderId) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, notified: true } : o
          ),
        }));
      },

      payOrder: (orderId, method) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        if (
          (method === "member_times" || method === "member_balance") &&
          order.memberId
        ) {
          const member = get().members.find((m) => m.id === order.memberId);
          if (!member) return;

          if (method === "member_times") {
            const needTimes = order.services.filter(
              (s) => s.serviceId === "S001"
            ).length;
            if (member.cardType !== "times" || member.remainingTimes < needTimes)
              return;
            set((s) => ({
              members: s.members.map((m) =>
                m.id === member.id
                  ? { ...m, remainingTimes: m.remainingTimes - needTimes }
                  : m
              ),
            }));
          }
          if (method === "member_balance") {
            if (member.balance < order.payableAmount) return;
            set((s) => ({
              members: s.members.map((m) =>
                m.id === member.id
                  ? {
                      ...m,
                      balance:
                        Math.round((m.balance - order.payableAmount) * 100) / 100,
                    }
                  : m
              ),
            }));
          }
        }

        const now = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  paid: true,
                  paymentMethod: method,
                  status: "picked_up",
                  pickedUpAt: o.pickedUpAt || now,
                }
              : o
          ),
        }));
      },

      createMember: ({ phone, name, cardType }) => {
        const today = new Date();
        let expiryDate = addDays(today, 1);
        let remainingTimes = 0;
        let totalTimes = 0;
        if (cardType === "times") {
          expiryDate = addDays(today, 365);
          remainingTimes = 10;
          totalTimes = 10;
        } else if (cardType === "monthly") {
          expiryDate = addDays(today, 30);
        } else if (cardType === "yearly") {
          expiryDate = addDays(today, 365);
        }
        const member: Member = {
          id: genId("M"),
          phone,
          name,
          cardType,
          remainingTimes,
          totalTimes,
          expiryDate,
          balance: 0,
          createdAt: today.toISOString(),
        };
        set((s) => ({ members: [...s.members, member] }));
        return member;
      },

      rechargeMemberTimes: (memberId, times) => {
        set((s) => ({
          members: s.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  remainingTimes: m.remainingTimes + times,
                  totalTimes: m.totalTimes + times,
                  expiryDate:
                    new Date(m.expiryDate) > new Date()
                      ? m.expiryDate
                      : addDays(new Date(), 365),
                }
              : m
          ),
        }));
      },

      renewMember: (memberId, cardType) => {
        const today = new Date();
        let expiryDate = addDays(today, 1);
        let remainingTimes = 0;
        let totalTimes = 0;
        if (cardType === "times") {
          expiryDate = addDays(today, 365);
          remainingTimes = 10;
          totalTimes = 10;
        } else if (cardType === "monthly") {
          expiryDate = addDays(today, 30);
        } else if (cardType === "yearly") {
          expiryDate = addDays(today, 365);
        }
        set((s) => ({
          members: s.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  cardType,
                  remainingTimes,
                  totalTimes,
                  expiryDate,
                }
              : m
          ),
        }));
      },

      findMemberByPhone: (phone) =>
        get().members.find((m) => m.phone === phone.trim()),

      getOrdersByStatus: (status) =>
        get().orders.filter((o) => o.status === status),

      getTodayStats: () => {
        const { orders, members } = get();
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
        const toPickup = orders.filter((o) => o.status === "completed").length;
        return {
          revenue: Math.round(revenue * 100) / 100,
          inProgress,
          toPickup,
          totalMembers: members.length,
        };
      },

      addPhotos: (orderId, stage, photos) => {
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            const key = stage === "before" ? "beforePhotos" : "afterPhotos";
            return { ...o, [key]: [...o[key], ...photos] };
          }),
        }));
      },

      removePhoto: (orderId, stage, index) => {
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            const key = stage === "before" ? "beforePhotos" : "afterPhotos";
            const arr = [...o[key]];
            arr.splice(index, 1);
            return { ...o, [key]: arr };
          }),
        }));
      },

      recordWeather: (date, condition, temperature = 20, description = "") => {
        const now = new Date().toISOString();
        set((s) => {
          const existing = s.weatherLogs.find((w) => w.date === date);
          if (existing) {
            return {
              weatherLogs: s.weatherLogs.map((w) =>
                w.date === date
                  ? { ...w, condition, temperature, description, recordedAt: now }
                  : w
              ),
            };
          }
          return {
            weatherLogs: [
              ...s.weatherLogs,
              { date, condition, temperature, description, recordedAt: now },
            ],
          };
        });
      },

      getTodayWeather: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get().weatherLogs.find((w) => w.date === today);
      },

      getWeatherByDate: (date) => get().weatherLogs.find((w) => w.date === date),

      isRainyDay: (date) => {
        const w = get().weatherLogs.find((x) => x.date === date);
        return w ? w.condition === "rainy" || w.condition === "stormy" : false;
      },

      scanAndCreateRainCoupons: () => {
        const { orders, coupons, members, isRainyDay } = get();
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = addDays(new Date(), -1);

        if (!isRainyDay(today)) return [];

        const washedYesterday = orders.filter((o) => {
          if (!o.pickedUpAt) return false;
          const pickedDate = new Date(o.pickedUpAt).toISOString().slice(0, 10);
          return pickedDate === yesterday && o.paid;
        });

        const newCoupons: Coupon[] = [];
        for (const order of washedYesterday) {
          const exists = coupons.find(
            (c) => c.orderId === order.id && c.type === "rain_rewash_half"
          );
          if (exists) continue;

          const member = order.memberId
            ? members.find((m) => m.id === order.memberId)
            : undefined;

          newCoupons.push({
            id: genId("C"),
            type: "rain_rewash_half",
            name: "雨后复洗半价券",
            description: "昨日洗车今日遇雨，凭券享受精洗/普洗半价优惠",
            discount: 50,
            discountType: "percent",
            orderId: order.id,
            plateNumber: order.plateNumber,
            memberId: member?.id,
            memberName: member?.name,
            memberPhone: member?.phone,
            status: "pending",
            rainDate: today,
            washDate: yesterday,
            expiresAt: addDays(new Date(), 7),
            createdAt: new Date().toISOString(),
          });
        }

        if (newCoupons.length > 0) {
          set((s) => ({ coupons: [...newCoupons, ...s.coupons] }));
        }
        return newCoupons;
      },

      issueCoupon: (couponId) => {
        const now = new Date().toISOString();
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === couponId ? { ...c, status: "issued" as CouponStatus, issuedAt: now } : c
          ),
        }));
      },

      useCoupon: (couponId) => {
        const now = new Date().toISOString();
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === couponId ? { ...c, status: "used" as CouponStatus, usedAt: now } : c
          ),
        }));
      },

      getPendingCoupons: () =>
        get().coupons.filter((c) => c.status === "pending"),

      getCouponsByPlate: (plateNumber) =>
        get().coupons.filter(
          (c) => c.plateNumber === plateNumber.toUpperCase().trim() && c.status !== "expired"
        ),

      addMaintenanceRecord: ({ plateNumber, type, serviceDate, memberId }) => {
        const { members } = get();
        const member = memberId ? members.find((m) => m.id === memberId) : undefined;
        const cycleDays = MAINTENANCE_CYCLE_DAYS[type];
        const nextDueDate = addDays(new Date(serviceDate), cycleDays);
        const record: MaintenanceRecord = {
          id: genId("MA"),
          plateNumber: plateNumber.toUpperCase().trim(),
          type,
          serviceDate,
          nextDueDate,
          memberId: member?.id,
          memberName: member?.name,
          memberPhone: member?.phone,
          createdAt: new Date().toISOString(),
          reminderIssued: false,
        };
        set((s) => ({ maintenanceRecords: [record, ...s.maintenanceRecords] }));
        return record;
      },

      updateMaintenanceRecord: (id, updates) => {
        set((s) => ({
          maintenanceRecords: s.maintenanceRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteMaintenanceRecord: (id) => {
        set((s) => ({
          maintenanceRecords: s.maintenanceRecords.filter((r) => r.id !== id),
        }));
      },

      getMaintenanceByPlate: (plateNumber) =>
        get().maintenanceRecords.filter(
          (r) => r.plateNumber === plateNumber.toUpperCase().trim()
        ),

      getMaintenanceReminders: () => {
        const { maintenanceRecords } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = today.getTime();
        const sevenDaysLater = addDays(today, 7);
        const sevenDaysLaterTs = new Date(sevenDaysLater).getTime();

        return maintenanceRecords.filter((r) => {
          const dueTs = new Date(r.nextDueDate).getTime();
          return dueTs <= sevenDaysLaterTs || dueTs < todayTs;
        });
      },

      issueMaintenanceReminder: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          maintenanceRecords: s.maintenanceRecords.map((r) =>
            r.id === id ? { ...r, reminderIssued: true, reminderIssuedAt: now } : r
          ),
        }));
      },

      getMemberBalance: (memberId) => {
        const member = get().members.find((m) => m.id === memberId);
        return member ? member.balance : 0;
      },
    }),
    {
      name: "car-wash-store",
      version: 5,
      partialize: (s) => ({
        members: s.members,
        orders: s.orders,
        coupons: s.coupons,
        weatherLogs: s.weatherLogs,
        maintenanceRecords: s.maintenanceRecords,
      }),
      migrate: (persistedState: unknown, version) => {
        const state = (persistedState ?? {}) as Record<string, unknown>;
        if (!Array.isArray(state.orders)) state.orders = [];
        if (!Array.isArray(state.coupons)) state.coupons = [];
        if (!Array.isArray(state.weatherLogs)) state.weatherLogs = [];
        if (!Array.isArray(state.maintenanceRecords)) state.maintenanceRecords = [];

        if (version < 2) {
          state.orders = (state.orders as Array<Record<string, unknown>>).map(
            (o) => ({
              ...o,
              beforePhotos: Array.isArray(o.beforePhotos) ? o.beforePhotos : [],
              afterPhotos: Array.isArray(o.afterPhotos) ? o.afterPhotos : [],
            })
          );
        }
        if (version < 3) {
          const fallbackTime = new Date().toISOString();
          state.orders = (state.orders as Array<Record<string, unknown>>).map(
            (o) => ({
              ...o,
              pickedUpAt:
                o.status === "picked_up"
                  ? (typeof o.pickedUpAt === "string" ? o.pickedUpAt : fallbackTime)
                  : o.pickedUpAt,
            })
          );
        }
        return state;
      },
    }
  )
);
