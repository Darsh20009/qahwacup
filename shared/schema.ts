
import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

export interface ICoffeeItem extends Document {
  id: string;
  nameAr: string;
  nameEn?: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  imageUrl?: string;
  isAvailable: number;
  availabilityStatus?: string;
  coffeeStrength?: string;
  strengthLevel?: number;
  isNewProduct?: number;
}

const CoffeeItemSchema = new Schema<ICoffeeItem>({
  id: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  category: { type: String, required: true },
  imageUrl: { type: String },
  isAvailable: { type: Number, default: 1, required: true },
  availabilityStatus: { type: String, default: "available" },
  coffeeStrength: { type: String, default: "classic" },
  strengthLevel: { type: Number },
  isNewProduct: { type: Number, default: 0 },
});

export const CoffeeItemModel = mongoose.model<ICoffeeItem>("CoffeeItem", CoffeeItemSchema);

export interface ICustomer extends Document {
  phone: string;
  email?: string;
  name: string;
  password?: string;
  registeredBy?: 'self' | 'cashier';
  isPasswordSet?: number;
  points?: number;
  carType?: string;
  carColor?: string;
  saveCarInfo?: number;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  password: { type: String },
  registeredBy: { type: String, default: 'self' },
  isPasswordSet: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  carType: { type: String },
  carColor: { type: String },
  saveCarInfo: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const CustomerModel = mongoose.model<ICustomer>("Customer", CustomerSchema);

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: number;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PasswordResetTokenModel = mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);

export interface IPasswordSetupOTP extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  used: number;
  attempts: number;
  createdAt: Date;
}

const PasswordSetupOTPSchema = new Schema<IPasswordSetupOTP>({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Number, default: 0, required: true },
  attempts: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create index for automatic cleanup of expired OTPs (TTL index)
PasswordSetupOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index for quick phone lookup
PasswordSetupOTPSchema.index({ phone: 1 });

export const PasswordSetupOTPModel = mongoose.model<IPasswordSetupOTP>("PasswordSetupOTP", PasswordSetupOTPSchema);

export interface IEmployee extends Document {
  username: string;
  password?: string;
  fullName: string;
  role: string;
  title?: string;
  phone: string;
  jobTitle: string;
  imageUrl?: string;
  shiftTime?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  workDays?: string[];
  deviceBalance?: number;
  commissionPercentage?: number;
  isActivated: number;
  branchId?: string;
  vehicleType?: string;
  vehiclePlateNumber?: string;
  vehicleColor?: string;
  licenseNumber?: string;
  isAvailableForDelivery?: number;
  employmentNumber: string;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  fullName: { type: String, required: true },
  role: { type: String, required: true },
  title: { type: String },
  phone: { type: String, required: true, unique: true },
  jobTitle: { type: String, required: true },
  imageUrl: { type: String },
  shiftTime: { type: String },
  shiftStartTime: { type: String },
  shiftEndTime: { type: String },
  workDays: [{ type: String }],
  deviceBalance: { type: Number, default: 0 },
  commissionPercentage: { type: Number, default: 0 },
  isActivated: { type: Number, default: 0, required: true },
  branchId: { type: String },
  vehicleType: { type: String },
  vehiclePlateNumber: { type: String },
  vehicleColor: { type: String },
  licenseNumber: { type: String },
  isAvailableForDelivery: { type: Number, default: 0 },
  employmentNumber: { type: String, required: true, unique: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const EmployeeModel = mongoose.model<IEmployee>("Employee", EmployeeSchema);

export interface IDiscountCode extends Document {
  code: string;
  discountPercentage: number;
  reason: string;
  employeeId: string;
  isActive: number;
  usageCount: number;
  createdAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  reason: { type: String, required: true },
  employeeId: { type: String, required: true },
  isActive: { type: Number, default: 1, required: true },
  usageCount: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const DiscountCodeModel = mongoose.model<IDiscountCode>("DiscountCode", DiscountCodeSchema);

export interface IOrder extends Document {
  orderNumber: string;
  items: any;
  totalAmount: number;
  paymentMethod: string;
  paymentDetails?: string;
  paymentReceiptUrl?: string;
  status: string;
  tableStatus?: 'pending' | 'payment_confirmed' | 'preparing' | 'delivering_to_table' | 'delivered' | 'cancelled';
  orderType?: 'regular' | 'table' | 'dine-in';
  customerInfo?: any;
  customerId?: string;
  employeeId?: string;
  assignedCashierId?: string;
  branchId?: string;
  tableNumber?: string;
  tableId?: string;
  customerNotes?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'cashier';
  carPickup?: any;
  discountCode?: string;
  discountPercentage?: number;
  deliveryType?: 'pickup' | 'delivery' | 'dine-in';
  deliveryAddress?: {
    fullAddress?: string;
    lat: number;
    lng: number;
    zone?: string;
    isInDeliveryZone?: boolean;
  };
  deliveryFee?: number;
  driverId?: string;
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  deliveryStatus?: string;
  deliveryStartedAt?: Date;
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  items: { type: Schema.Types.Mixed, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: String },
  paymentReceiptUrl: { type: String },
  status: { type: String, default: "pending", required: true },
  tableStatus: { type: String, enum: ['pending', 'payment_confirmed', 'preparing', 'delivering_to_table', 'delivered', 'cancelled'] },
  orderType: { type: String, enum: ['regular', 'table', 'dine-in'], default: 'regular' },
  customerInfo: { type: Schema.Types.Mixed },
  customerId: { type: String },
  employeeId: { type: String },
  assignedCashierId: { type: String },
  branchId: { type: String },
  tableNumber: { type: String },
  tableId: { type: String },
  customerNotes: { type: String },
  cancellationReason: { type: String },
  cancelledBy: { type: String, enum: ['customer', 'cashier'] },
  carPickup: { type: Schema.Types.Mixed },
  discountCode: { type: String },
  discountPercentage: { type: Number },
  deliveryType: { type: String, enum: ['pickup', 'delivery', 'dine-in'] },
  deliveryAddress: {
    fullAddress: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    zone: { type: String },
    isInDeliveryZone: { type: Boolean }
  },
  deliveryFee: { type: Number, default: 0 },
  driverId: { type: String },
  driverLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  deliveryStatus: { type: String },
  deliveryStartedAt: { type: Date },
  estimatedDeliveryTime: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export interface IOrderItem extends Document {
  orderId: string;
  coffeeItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  orderId: { type: String, required: true },
  coffeeItemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

export const OrderItemModel = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

export interface ICartItem extends Document {
  sessionId: string;
  coffeeItemId: string;
  quantity: number;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  sessionId: { type: String, required: true },
  coffeeItemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CartItemModel = mongoose.model<ICartItem>("CartItem", CartItemSchema);

export interface ILoyaltyCard extends Document {
  customerName?: string;
  phoneNumber: string;
  qrToken: string;
  cardNumber: string;
  stamps: number;
  freeCupsEarned: number;
  freeCupsRedeemed: number;
  points: number;
  tier: string;
  totalSpent: number;
  discountCount: number;
  status: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyCardSchema = new Schema<ILoyaltyCard>({
  customerName: { type: String },
  phoneNumber: { type: String, required: true },
  qrToken: { type: String, required: true, unique: true },
  cardNumber: { type: String, required: true, unique: true },
  stamps: { type: Number, default: 0, required: true },
  freeCupsEarned: { type: Number, default: 0, required: true },
  freeCupsRedeemed: { type: Number, default: 0, required: true },
  points: { type: Number, default: 0, required: true },
  tier: { type: String, default: "bronze", required: true },
  totalSpent: { type: Number, default: 0, required: true },
  discountCount: { type: Number, default: 0, required: true },
  status: { type: String, default: "active", required: true },
  lastUsedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const LoyaltyCardModel = mongoose.model<ILoyaltyCard>("LoyaltyCard", LoyaltyCardSchema);

export interface ICardCode extends Document {
  code: string;
  issuedForOrderId: string;
  drinkName: string;
  isRedeemed: number;
  redeemedAt?: Date;
  redeemedByCardId?: string;
  createdAt: Date;
}

const CardCodeSchema = new Schema<ICardCode>({
  code: { type: String, required: true, unique: true },
  issuedForOrderId: { type: String, required: true },
  drinkName: { type: String, required: true },
  isRedeemed: { type: Number, default: 0, required: true },
  redeemedAt: { type: Date },
  redeemedByCardId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const CardCodeModel = mongoose.model<ICardCode>("CardCode", CardCodeSchema);

export interface ILoyaltyTransaction extends Document {
  cardId: string;
  orderId?: string;
  type: string;
  pointsChange: number;
  discountAmount?: number;
  orderAmount?: number;
  description?: string;
  employeeId?: string;
  createdAt: Date;
}

const LoyaltyTransactionSchema = new Schema<ILoyaltyTransaction>({
  cardId: { type: String, required: true },
  orderId: { type: String },
  type: { type: String, required: true },
  pointsChange: { type: Number, required: true },
  discountAmount: { type: Number },
  orderAmount: { type: Number },
  description: { type: String },
  employeeId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const LoyaltyTransactionModel = mongoose.model<ILoyaltyTransaction>("LoyaltyTransaction", LoyaltyTransactionSchema);

export interface ILoyaltyReward extends Document {
  nameAr: string;
  nameEn?: string;
  description: string;
  pointsCost: number;
  discountPercentage?: number;
  discountAmount?: number;
  tier?: string;
  isActive: number;
  createdAt: Date;
}

const LoyaltyRewardSchema = new Schema<ILoyaltyReward>({
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  discountPercentage: { type: Number },
  discountAmount: { type: Number },
  tier: { type: String },
  isActive: { type: Number, default: 1, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LoyaltyRewardModel = mongoose.model<ILoyaltyReward>("LoyaltyReward", LoyaltyRewardSchema);

export interface IIngredient extends Document {
  nameAr: string;
  nameEn?: string;
  isAvailable: number;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  isAvailable: { type: Number, default: 1, required: true },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const IngredientModel = mongoose.model<IIngredient>("Ingredient", IngredientSchema);

export interface ICoffeeItemIngredient extends Document {
  coffeeItemId: string;
  ingredientId: string;
  createdAt: Date;
}

const CoffeeItemIngredientSchema = new Schema<ICoffeeItemIngredient>({
  coffeeItemId: { type: String, required: true },
  ingredientId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CoffeeItemIngredientModel = mongoose.model<ICoffeeItemIngredient>("CoffeeItemIngredient", CoffeeItemIngredientSchema);

export interface IBranch extends Document {
  nameAr: string;
  nameEn?: string;
  address: string;
  phone: string;
  city: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  mapsUrl?: string;
  isActive: number;
  managerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>({
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  mapsUrl: { type: String },
  isActive: { type: Number, default: 1, required: true },
  managerName: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const BranchModel = mongoose.model<IBranch>("Branch", BranchSchema);

export interface ICategory extends Document {
  nameAr: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  nameAr: { type: String, required: true, unique: true },
  nameEn: { type: String },
  description: { type: String },
  icon: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Number, default: 1, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);

export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);

export interface IDeliveryZone extends Document {
  nameAr: string;
  nameEn?: string;
  coordinates: Array<{lat: number; lng: number}>;
  deliveryFee: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>({
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  coordinates: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  deliveryFee: { type: Number, required: true, default: 10 },
  isActive: { type: Number, default: 1, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DeliveryZoneModel = mongoose.model<IDeliveryZone>("DeliveryZone", DeliveryZoneSchema);

export interface ITable extends Document {
  tableNumber: string;
  qrToken: string;
  branchId: string;
  capacity?: number;
  location?: string;
  isActive: number;
  isOccupied: number;
  currentOrderId?: string;
  reservedFor?: {
    customerName: string;
    customerPhone: string;
    customerId?: string;
    reservationDate: Date;
    reservationTime: string;
    numberOfGuests: number;
    reservedAt: Date;
    reservedBy: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  };
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>({
  tableNumber: { type: String, required: true },
  qrToken: { type: String, required: true, unique: true },
  branchId: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  location: { type: String },
  isActive: { type: Number, default: 1, required: true },
  isOccupied: { type: Number, default: 0, required: true },
  currentOrderId: { type: String },
  reservedFor: {
    customerName: { type: String },
    customerPhone: { type: String },
    customerId: { type: String },
    reservationDate: { type: Date },
    reservationTime: { type: String },
    numberOfGuests: { type: Number },
    reservedAt: { type: Date },
    reservedBy: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TableSchema.index({ tableNumber: 1, branchId: 1 }, { unique: true });

export const TableModel = mongoose.model<ITable>("Table", TableSchema);

export interface IAttendance extends Document {
  employeeId: string;
  branchId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  checkInLocation: {
    lat: number;
    lng: number;
  };
  checkOutLocation?: {
    lat: number;
    lng: number;
  };
  checkInPhoto: string;
  checkOutPhoto?: string;
  status: 'checked_in' | 'checked_out' | 'late' | 'absent';
  shiftDate: Date;
  notes?: string;
  isLate: number;
  lateMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: String, required: true },
  branchId: { type: String, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
  checkInLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  checkOutLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  checkInPhoto: { type: String, required: true },
  checkOutPhoto: { type: String },
  status: { type: String, enum: ['checked_in', 'checked_out', 'late', 'absent'], default: 'checked_in', required: true },
  shiftDate: { type: Date, required: true },
  notes: { type: String },
  isLate: { type: Number, default: 0, required: true },
  lateMinutes: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ employeeId: 1, shiftDate: 1 });
AttendanceSchema.index({ branchId: 1, shiftDate: 1 });

export const AttendanceModel = mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export const insertCoffeeItemSchema = z.object({
  id: z.string(),
  nameAr: z.string(),
  nameEn: z.string().optional(),
  description: z.string(),
  price: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  oldPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  category: z.string(),
  imageUrl: z.string().optional(),
  isAvailable: z.number().optional(),
  availabilityStatus: z.string().optional(),
  coffeeStrength: z.string().optional(),
  strengthLevel: z.number().optional(),
  isNewProduct: z.number().optional(),
});

export const insertEmployeeSchema = z.object({
  username: z.string(),
  password: z.string().optional(),
  fullName: z.string(),
  role: z.string(),
  title: z.string().optional(),
  phone: z.string(),
  jobTitle: z.string(),
  imageUrl: z.string().optional(),
  shiftTime: z.string().optional(),
  commissionPercentage: z.number().optional(),
  isActivated: z.number().optional(),
  branchId: z.string().optional(),
  vehicleType: z.string().optional(),
  vehiclePlateNumber: z.string().optional(),
  vehicleColor: z.string().optional(),
  licenseNumber: z.string().optional(),
  isAvailableForDelivery: z.number().optional(),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    updatedAt: z.date().optional(),
  }).optional(),
});

export const insertOrderSchema = z.object({
  items: z.any(),
  totalAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  paymentMethod: z.string(),
  paymentDetails: z.string().optional(),
  paymentReceiptUrl: z.string().optional(),
  status: z.string().optional(),
  tableStatus: z.enum(['pending', 'payment_confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).optional(),
  orderType: z.enum(['regular', 'table', 'dine-in']).optional(),
  customerInfo: z.any().optional(),
  customerId: z.string().optional(),
  employeeId: z.string().optional(),
  assignedCashierId: z.string().optional(),
  branchId: z.string().optional(),
  tableNumber: z.string().optional(),
  tableId: z.string().optional(),
  customerNotes: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancelledBy: z.enum(['customer', 'cashier']).optional(),
  carPickup: z.any().optional(),
  deliveryType: z.enum(['pickup', 'delivery', 'dine-in']).optional(),
  deliveryAddress: z.object({
    fullAddress: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    zone: z.string().optional(),
    isInDeliveryZone: z.boolean().optional(),
  }).optional(),
  deliveryFee: z.number().optional(),
  driverId: z.string().optional(),
  driverLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    updatedAt: z.date().optional(),
  }).optional(),
  deliveryStatus: z.string().optional(),
  deliveryStartedAt: z.date().optional(),
  estimatedDeliveryTime: z.date().optional(),
  deliveredAt: z.date().optional(),
}).refine((data) => {
  const requiresReceipt = ['alinma', 'ur', 'barq', 'rajhi'].includes(data.paymentMethod);
  if (requiresReceipt && !data.paymentReceiptUrl) {
    return false;
  }
  return true;
}, {
  message: "إيصال الدفع مطلوب لطرق الدفع الإلكترونية",
  path: ["paymentReceiptUrl"],
}).refine((data) => {
  if (data.deliveryType === 'delivery' && !data.deliveryAddress) {
    return false;
  }
  return true;
}, {
  message: "عنوان التوصيل مطلوب لطلبات التوصيل",
  path: ["deliveryAddress"],
});

export const insertOrderItemSchema = z.object({
  orderId: z.string(),
  coffeeItemId: z.string(),
  quantity: z.number(),
  unitPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  totalPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
});

export const insertCartItemSchema = z.object({
  sessionId: z.string(),
  coffeeItemId: z.string(),
  quantity: z.number(),
});

export const insertCustomerSchema = z.object({
  phone: z.string(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  password: z.string().min(4, "كلمة المرور يجب أن تكون على الأقل 4 أحرف").optional(),
  registeredBy: z.enum(['self', 'cashier']).optional(),
  isPasswordSet: z.number().optional(),
  points: z.number().optional(),
  carType: z.string().optional(),
  carColor: z.string().optional(),
  saveCarInfo: z.number().optional(),
});

export const insertPasswordResetTokenSchema = z.object({
  email: z.string(),
  token: z.string(),
  expiresAt: z.date(),
});

export const insertDiscountCodeSchema = z.object({
  code: z.string(),
  discountPercentage: z.number(),
  reason: z.string(),
  employeeId: z.string(),
  isActive: z.number().optional(),
});

export const insertLoyaltyCardSchema = z.object({
  customerName: z.string().optional(),
  phoneNumber: z.string(),
});

export const insertCardCodeSchema = z.object({
  issuedForOrderId: z.string(),
  drinkName: z.string(),
});

export const insertLoyaltyTransactionSchema = z.object({
  cardId: z.string(),
  orderId: z.string().optional(),
  type: z.string(),
  pointsChange: z.number(),
  discountAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  orderAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  description: z.string().optional(),
  employeeId: z.string().optional(),
});

export const insertLoyaltyRewardSchema = z.object({
  nameAr: z.string(),
  nameEn: z.string().optional(),
  description: z.string(),
  pointsCost: z.number(),
  discountPercentage: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  discountAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  tier: z.string().optional(),
  isActive: z.number().optional(),
});

export const insertIngredientSchema = z.object({
  nameAr: z.string(),
  nameEn: z.string().optional(),
  isAvailable: z.number().optional(),
  icon: z.string().optional(),
});

export const insertCoffeeItemIngredientSchema = z.object({
  coffeeItemId: z.string(),
  ingredientId: z.string(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertBranchSchema = z.object({
  nameAr: z.string().min(2, "اسم الفرع مطلوب"),
  nameEn: z.string().optional(),
  address: z.string().min(5, "العنوان مطلوب"),
  phone: z.string().min(9, "رقم الهاتف مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  mapsUrl: z.string().optional(),
  isActive: z.number().optional(),
  managerName: z.string().optional(),
});

export const insertCategorySchema = z.object({
  nameAr: z.string().min(2, "اسم الفئة مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.number().optional(),
});

export const insertDeliveryZoneSchema = z.object({
  nameAr: z.string().min(2, "اسم المنطقة مطلوب"),
  nameEn: z.string().optional(),
  coordinates: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).min(3, "يجب تحديد على الأقل 3 نقاط لرسم المنطقة"),
  deliveryFee: z.number().default(10),
  isActive: z.number().optional(),
});

export const insertTableSchema = z.object({
  tableNumber: z.string().min(1, "رقم الطاولة مطلوب"),
  qrToken: z.string().optional(),
  branchId: z.string().min(1, "معرّف الفرع مطلوب"),
  capacity: z.number().optional(),
  location: z.string().optional(),
  isActive: z.number().optional(),
  isOccupied: z.number().optional(),
  currentOrderId: z.string().optional(),
  reservedFor: z.object({
    customerName: z.string(),
    customerPhone: z.string(),
    customerId: z.string().optional(),
    reservationDate: z.coerce.date().optional(),
    reservationTime: z.string().optional(),
    numberOfGuests: z.number().optional(),
    reservedAt: z.coerce.date().optional(),
    reservedBy: z.string(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  }).optional(),
});

export const insertAttendanceSchema = z.object({
  employeeId: z.string(),
  branchId: z.string(),
  checkInTime: z.coerce.date(),
  checkOutTime: z.coerce.date().optional(),
  checkInLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  checkOutLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  checkInPhoto: z.string(),
  checkOutPhoto: z.string().optional(),
  status: z.enum(['checked_in', 'checked_out', 'late', 'absent']).optional(),
  shiftDate: z.coerce.date(),
  notes: z.string().optional(),
  isLate: z.number().optional(),
  lateMinutes: z.number().optional(),
});

export type CoffeeItem = ICoffeeItem;
export type InsertCoffeeItem = z.infer<typeof insertCoffeeItemSchema>;

export type Customer = ICustomer;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Employee = IEmployee;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type DiscountCode = IDiscountCode;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type Order = IOrder;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = IOrderItem;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = ICartItem;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type PasswordResetToken = IPasswordResetToken;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type LoyaltyCard = ILoyaltyCard;
export type InsertLoyaltyCard = z.infer<typeof insertLoyaltyCardSchema>;

export type CardCode = ICardCode;
export type InsertCardCode = z.infer<typeof insertCardCodeSchema>;

export type LoyaltyTransaction = ILoyaltyTransaction;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;

export type LoyaltyReward = ILoyaltyReward;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;

export type Ingredient = IIngredient;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type CoffeeItemIngredient = ICoffeeItemIngredient;
export type InsertCoffeeItemIngredient = z.infer<typeof insertCoffeeItemIngredientSchema>;

export type User = IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Branch = IBranch;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

export type Category = ICategory;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type DeliveryZone = IDeliveryZone;
export type InsertDeliveryZone = z.infer<typeof insertDeliveryZoneSchema>;

export type Table = ITable;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type Attendance = IAttendance;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type PaymentMethod = 'cash' | 'alinma' | 'ur' | 'barq' | 'rajhi' | 'qahwa-card' | 'pos' | 'delivery';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  details: string;
  icon: string;
  requiresReceipt?: boolean;
}

export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'driver';
export type JobTitle = 'كاشير' | 'محاسب' | 'بائع' | 'عارض' | 'سائق' | 'مدير' | 'مالك';

export type OrderStatus = 'pending' | 'payment_confirmed' | 'in_progress' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export type CoffeeCategory = 'basic' | 'hot' | 'cold' | 'specialty' | 'desserts';

export type CoffeeStrength = 'classic' | 'mild' | 'medium' | 'strong';

export interface CoffeeStrengthInfo {
  id: CoffeeStrength;
  nameAr: string;
  nameEn: string;
  description: string;
  levelRange: string;
  color: string;
  icon: string;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierInfo {
  id: LoyaltyTier;
  nameAr: string;
  nameEn: string;
  pointsRequired: number;
  benefits: string[];
  color: string;
  icon: string;
}
