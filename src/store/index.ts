import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CardType,
  Member,
  Order,
  OrderService,
  OrderStatus,
  PaymentMethod,
  Service,
} from "@/types";

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
  },
];

export interface AppStore {
  services: Service[];
  members: Member[];
  orders: Order[];

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

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, paid: true, paymentMethod: method, status: "picked_up" }
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
    }),
    {
      name: "car-wash-store",
      version: 1,
      partialize: (s) => ({
        members: s.members,
        orders: s.orders,
      }),
    }
  )
);
