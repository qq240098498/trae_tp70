export type CardType = "times" | "monthly" | "yearly";

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "picked_up";

export type PaymentMethod =
  | "cash"
  | "wechat"
  | "alipay"
  | "member_times"
  | "member_balance";

export type PhotoStage = "before" | "after";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  description?: string;
}

export interface OrderService {
  id: string;
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
}

export interface Member {
  id: string;
  phone: string;
  name: string;
  cardType: CardType;
  remainingTimes: number;
  totalTimes: number;
  expiryDate: string;
  balance: number;
  createdAt: string;
}

export interface Order {
  id: string;
  plateNumber: string;
  carModel: string;
  color: string;
  mileage: number;
  memberId?: string;
  memberName?: string;
  memberCardType?: CardType;
  services: OrderService[];
  status: OrderStatus;
  notified: boolean;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  paymentMethod?: PaymentMethod;
  paid: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  pickedUpAt?: string;
  remark?: string;
  beforePhotos: string[];
  afterPhotos: string[];
}

export type CouponStatus = "pending" | "issued" | "used" | "expired";
export type CouponType = "rain_rewash_half";

export interface Coupon {
  id: string;
  type: CouponType;
  name: string;
  description: string;
  discount: number;
  discountType: "percent" | "amount";
  orderId: string;
  plateNumber: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  status: CouponStatus;
  rainDate: string;
  washDate: string;
  issuedAt?: string;
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "stormy";

export interface WeatherLog {
  date: string;
  condition: WeatherCondition;
  temperature: number;
  description: string;
  recordedAt: string;
}

export const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: "待施工",
  in_progress: "施工中",
  completed: "已完工",
  picked_up: "已取车",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-navy-50 text-navy-700 border-navy-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  picked_up: "bg-slate-50 text-slate-600 border-slate-200",
};

export const CARD_TYPE_TEXT: Record<CardType, string> = {
  times: "次卡",
  monthly: "月卡",
  yearly: "年卡",
};

export const CARD_TYPE_COLOR: Record<CardType, string> = {
  times: "bg-sky-50 text-sky-700 border-sky-200",
  monthly: "bg-violet-50 text-violet-700 border-violet-200",
  yearly: "bg-gold-50 text-gold-700 border-gold-200",
};

export const PAYMENT_METHOD_TEXT: Record<PaymentMethod, string> = {
  cash: "现金",
  wechat: "微信支付",
  alipay: "支付宝",
  member_times: "会员卡(次)",
  member_balance: "会员卡(余额)",
};

export const CAR_MODELS = [
  "轿车",
  "SUV",
  "MPV",
  "跑车",
  "皮卡",
  "面包车",
  "新能源车",
  "其他",
];

export const CAR_COLORS = [
  "白色",
  "黑色",
  "银色",
  "灰色",
  "红色",
  "蓝色",
  "金色",
  "棕色",
  "绿色",
  "其他",
];

export const COUPON_STATUS_TEXT: Record<CouponStatus, string> = {
  pending: "待发放",
  issued: "已发放",
  used: "已使用",
  expired: "已过期",
};

export const COUPON_STATUS_COLOR: Record<CouponStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  issued: "bg-sky-50 text-sky-700 border-sky-200",
  used: "bg-slate-50 text-slate-600 border-slate-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
};

export const WEATHER_TEXT: Record<WeatherCondition, string> = {
  sunny: "晴天",
  cloudy: "多云",
  rainy: "小雨",
  stormy: "暴雨",
};

export const WEATHER_COLOR: Record<WeatherCondition, string> = {
  sunny: "bg-amber-50 text-amber-700 border-amber-200",
  cloudy: "bg-slate-50 text-slate-600 border-slate-200",
  rainy: "bg-sky-50 text-sky-700 border-sky-200",
  stormy: "bg-indigo-50 text-indigo-700 border-indigo-200",
};
