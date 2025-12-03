
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
  costOfGoods?: number;
  grossProfit?: number;
  inventoryDeducted?: number;
  inventoryDeductionDetails?: Array<{
    rawItemId: string;
    rawItemName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }>;
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
  costOfGoods: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
  inventoryDeducted: { type: Number, default: 0 },
  inventoryDeductionDetails: [{
    rawItemId: { type: String },
    rawItemName: { type: String },
    quantity: { type: Number },
    unit: { type: String },
    unitCost: { type: Number },
    totalCost: { type: Number }
  }],
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

// ZATCA Phase 1 & 2 Compliant Tax Invoice
export interface ITaxInvoice extends Document {
  // Basic Invoice Info
  invoiceNumber: string;
  uuid: string; // UUID for ZATCA compliance
  orderId: string;
  
  // Seller Information (المنشأة)
  sellerName: string;
  sellerNameEn?: string;
  sellerVatNumber: string;
  sellerCrNumber?: string; // Commercial Registration
  sellerAddress: string;
  sellerCity?: string;
  sellerPostalCode?: string;
  sellerBuildingNumber?: string;
  sellerDistrict?: string;
  sellerCountry: string;
  branchId?: string;
  
  // Buyer/Customer Information (المشتري)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerVatNumber?: string; // VAT number if B2B
  customerAddress?: string;
  
  // Invoice Type
  invoiceType: 'standard' | 'simplified' | 'debit_note' | 'credit_note';
  invoiceTypeCode: string; // 388 for standard, 381 for credit note, 383 for debit note
  transactionType: 'B2B' | 'B2C'; // Business to Business or Business to Customer
  
  // Items and Amounts
  items: Array<{
    itemId: string;
    nameAr: string;
    nameEn?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxableAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  
  // Totals
  subtotal: number;
  totalDiscountAmount: number;
  taxableAmount: number; // Amount before VAT
  taxAmount: number; // VAT amount (15%)
  totalAmount: number; // Total with VAT
  
  // Payment Information
  paymentMethod: string;
  paymentMeans?: string; // 10 = Cash, 30 = Credit, etc.
  
  // ZATCA Compliance Fields
  invoiceCounter: number; // Sequential counter
  previousInvoiceHash?: string; // Hash of previous invoice
  invoiceHash: string; // SHA-256 hash
  qrCode: string; // TLV encoded base64 QR code
  xmlContent?: string; // Full XML invoice
  pdfUrl?: string;
  
  // Dates
  invoiceDate: Date;
  supplyDate?: Date; // Date of supply
  
  // Status
  zatcaStatus: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'cleared';
  zatcaSubmissionId?: string;
  zatcaResponse?: string;
  
  // Employee who created the invoice
  createdBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TaxInvoiceSchema = new Schema<ITaxInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  uuid: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  
  sellerName: { type: String, required: true, default: 'قهوة كوب' },
  sellerNameEn: { type: String, default: 'Qahwa Cup' },
  sellerVatNumber: { type: String, required: true, default: '311234567890003' },
  sellerCrNumber: { type: String },
  sellerAddress: { type: String, required: true, default: 'الرياض، المملكة العربية السعودية' },
  sellerCity: { type: String, default: 'الرياض' },
  sellerPostalCode: { type: String },
  sellerBuildingNumber: { type: String },
  sellerDistrict: { type: String },
  sellerCountry: { type: String, default: 'SA' },
  branchId: { type: String },
  
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  customerVatNumber: { type: String },
  customerAddress: { type: String },
  
  invoiceType: { type: String, enum: ['standard', 'simplified', 'debit_note', 'credit_note'], default: 'simplified' },
  invoiceTypeCode: { type: String, default: '388' },
  transactionType: { type: String, enum: ['B2B', 'B2C'], default: 'B2C' },
  
  items: { type: Schema.Types.Mixed, required: true },
  
  subtotal: { type: Number, required: true },
  totalDiscountAmount: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  paymentMethod: { type: String, required: true },
  paymentMeans: { type: String },
  
  invoiceCounter: { type: Number, required: true },
  previousInvoiceHash: { type: String },
  invoiceHash: { type: String, required: true },
  qrCode: { type: String, required: true },
  xmlContent: { type: String },
  pdfUrl: { type: String },
  
  invoiceDate: { type: Date, required: true },
  supplyDate: { type: Date },
  
  zatcaStatus: { type: String, enum: ['pending', 'submitted', 'accepted', 'rejected', 'cleared'], default: 'pending' },
  zatcaSubmissionId: { type: String },
  zatcaResponse: { type: String },
  
  createdBy: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TaxInvoiceSchema.index({ invoiceDate: -1 });
TaxInvoiceSchema.index({ branchId: 1, invoiceDate: -1 });
TaxInvoiceSchema.index({ zatcaStatus: 1 });

export const TaxInvoiceModel = mongoose.model<ITaxInvoice>("TaxInvoice", TaxInvoiceSchema);

// ===== ACCOUNTING SYSTEM MODELS =====

// Revenue Tracking - الإيرادات
export interface IRevenue extends Document {
  branchId: string;
  date: Date;
  orderId?: string;
  invoiceId?: string;
  category: 'sales' | 'delivery_fee' | 'service_charge' | 'other';
  description?: string;
  grossAmount: number; // Before VAT
  vatAmount: number;
  netAmount: number; // After VAT
  paymentMethod: string;
  employeeId?: string;
  notes?: string;
  createdAt: Date;
}

const RevenueSchema = new Schema<IRevenue>({
  branchId: { type: String, required: true },
  date: { type: Date, required: true },
  orderId: { type: String },
  invoiceId: { type: String },
  category: { type: String, enum: ['sales', 'delivery_fee', 'service_charge', 'other'], default: 'sales' },
  description: { type: String },
  grossAmount: { type: Number, required: true },
  vatAmount: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  employeeId: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

RevenueSchema.index({ branchId: 1, date: -1 });
RevenueSchema.index({ category: 1 });

export const RevenueModel = mongoose.model<IRevenue>("Revenue", RevenueSchema);

// Expense Tracking - المصروفات
export interface IExpense extends Document {
  branchId: string;
  date: Date;
  category: 'inventory' | 'salaries' | 'rent' | 'utilities' | 'marketing' | 'maintenance' | 'supplies' | 'other';
  subcategory?: string;
  description: string;
  amount: number;
  vatAmount?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  vendorName?: string;
  vendorVatNumber?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  approvedBy?: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  branchId: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, enum: ['inventory', 'salaries', 'rent', 'utilities', 'marketing', 'maintenance', 'supplies', 'other'], required: true },
  subcategory: { type: String },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'other'], required: true },
  vendorName: { type: String },
  vendorVatNumber: { type: String },
  invoiceNumber: { type: String },
  receiptUrl: { type: String },
  approvedBy: { type: String },
  createdBy: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ExpenseSchema.index({ branchId: 1, date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ status: 1 });

export const ExpenseModel = mongoose.model<IExpense>("Expense", ExpenseSchema);

// Daily Cash Register - الصندوق اليومي
export interface ICashRegister extends Document {
  branchId: string;
  date: Date;
  employeeId: string;
  
  // Opening
  openingBalance: number;
  openingTime: Date;
  
  // Transactions
  cashSales: number;
  cardSales: number;
  otherSales: number;
  
  // Expenses
  cashExpenses: number;
  
  // Deposits/Withdrawals
  deposits: number;
  withdrawals: number;
  
  // Closing
  expectedCash: number;
  actualCash: number;
  difference: number;
  closingTime?: Date;
  closedBy?: string;
  
  // Status
  status: 'open' | 'closed';
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const CashRegisterSchema = new Schema<ICashRegister>({
  branchId: { type: String, required: true },
  date: { type: Date, required: true },
  employeeId: { type: String, required: true },
  
  openingBalance: { type: Number, required: true },
  openingTime: { type: Date, required: true },
  
  cashSales: { type: Number, default: 0 },
  cardSales: { type: Number, default: 0 },
  otherSales: { type: Number, default: 0 },
  
  cashExpenses: { type: Number, default: 0 },
  
  deposits: { type: Number, default: 0 },
  withdrawals: { type: Number, default: 0 },
  
  expectedCash: { type: Number, default: 0 },
  actualCash: { type: Number, default: 0 },
  difference: { type: Number, default: 0 },
  closingTime: { type: Date },
  closedBy: { type: String },
  
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  notes: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CashRegisterSchema.index({ branchId: 1, date: -1 });
CashRegisterSchema.index({ employeeId: 1, date: -1 });

export const CashRegisterModel = mongoose.model<ICashRegister>("CashRegister", CashRegisterSchema);

// Daily Accounting Summary - ملخص المحاسبة اليومي
export interface IDailySummary extends Document {
  branchId: string;
  date: Date;
  
  // Revenue
  totalOrders: number;
  totalRevenue: number;
  totalVatCollected: number;
  
  // Revenue by Payment Method
  cashRevenue: number;
  cardRevenue: number;
  otherRevenue: number;
  
  // Revenue by Category
  salesRevenue: number;
  deliveryRevenue: number;
  
  // Cost of Goods Sold (COGS)
  totalCogs: number;
  
  // Expenses
  totalExpenses: number;
  
  // Profit
  grossProfit: number; // Revenue - COGS
  netProfit: number; // Gross Profit - Expenses
  profitMargin: number; // (Net Profit / Revenue) * 100
  
  // Discounts Given
  totalDiscounts: number;
  
  // Cancelled Orders
  cancelledOrders: number;
  cancelledAmount: number;
  
  // Generated automatically
  isGenerated: number;
  generatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>({
  branchId: { type: String, required: true },
  date: { type: Date, required: true },
  
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalVatCollected: { type: Number, default: 0 },
  
  cashRevenue: { type: Number, default: 0 },
  cardRevenue: { type: Number, default: 0 },
  otherRevenue: { type: Number, default: 0 },
  
  salesRevenue: { type: Number, default: 0 },
  deliveryRevenue: { type: Number, default: 0 },
  
  totalCogs: { type: Number, default: 0 },
  
  totalExpenses: { type: Number, default: 0 },
  
  grossProfit: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  
  totalDiscounts: { type: Number, default: 0 },
  
  cancelledOrders: { type: Number, default: 0 },
  cancelledAmount: { type: Number, default: 0 },
  
  isGenerated: { type: Number, default: 0 },
  generatedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DailySummarySchema.index({ branchId: 1, date: -1 }, { unique: true });

export const DailySummaryModel = mongoose.model<IDailySummary>("DailySummary", DailySummarySchema);

// Kitchen Order Queue - طلبات المطبخ
export interface IKitchenOrder extends Document {
  orderId: string;
  orderNumber: string;
  branchId: string;
  items: Array<{
    itemId: string;
    nameAr: string;
    quantity: number;
    notes?: string;
    status: 'pending' | 'preparing' | 'ready';
    preparedBy?: string;
    preparedAt?: Date;
  }>;
  priority: 'normal' | 'high' | 'urgent';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  customerName?: string;
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  assignedTo?: string; // Cook/Barista ID
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KitchenOrderSchema = new Schema<IKitchenOrder>({
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  branchId: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    nameAr: { type: String, required: true },
    quantity: { type: Number, required: true },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'preparing', 'ready'], default: 'pending' },
    preparedBy: { type: String },
    preparedAt: { type: Date },
  }],
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  orderType: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], required: true },
  tableNumber: { type: String },
  customerName: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'ready', 'completed', 'cancelled'], default: 'pending' },
  assignedTo: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
  estimatedTime: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

KitchenOrderSchema.index({ branchId: 1, status: 1 });
KitchenOrderSchema.index({ assignedTo: 1, status: 1 });
KitchenOrderSchema.index({ createdAt: -1 });

export const KitchenOrderModel = mongoose.model<IKitchenOrder>("KitchenOrder", KitchenOrderSchema);

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
  isAtBranch?: number;
  distanceFromBranch?: number;
  checkOutIsAtBranch?: number;
  checkOutDistanceFromBranch?: number;
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
  isAtBranch: { type: Number, default: 1 },
  distanceFromBranch: { type: Number, default: 0 },
  checkOutIsAtBranch: { type: Number },
  checkOutDistanceFromBranch: { type: Number },
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
  shiftTime: z.string().optional().nullable(),
  shiftStartTime: z.string().optional(),
  shiftEndTime: z.string().optional(),
  commissionPercentage: z.number().optional(),
  deviceBalance: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val).optional(),
  isActivated: z.number().optional(),
  branchId: z.string().optional(),
  employmentNumber: z.string().optional(),
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
  costOfGoods: z.number().optional(),
  grossProfit: z.number().optional(),
  inventoryDeducted: z.number().optional(),
  inventoryDeductionDetails: z.array(z.object({
    rawItemId: z.string(),
    rawItemName: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unitCost: z.number(),
    totalCost: z.number(),
  })).optional(),
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

export type PaymentMethod = 'cash' | 'alinma' | 'ur' | 'barq' | 'rajhi' | 'qahwa-card' | 'pos' | 'delivery' | 'apple_pay';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  details: string;
  icon: string;
  requiresReceipt?: boolean;
}
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

// ================== INVENTORY MANAGEMENT MODELS ==================

// المواد الخام - Raw Items
export interface IRawItem extends Document {
  code: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  category: 'ingredient' | 'packaging' | 'equipment' | 'consumable' | 'other';
  unit: 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'box' | 'bag';
  unitCost: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplierId?: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

const RawItemSchema = new Schema<IRawItem>({
  code: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  description: { type: String },
  category: { type: String, enum: ['ingredient', 'packaging', 'equipment', 'consumable', 'other'], required: true },
  unit: { type: String, enum: ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag'], required: true },
  unitCost: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 0 },
  maxStockLevel: { type: Number },
  supplierId: { type: String },
  isActive: { type: Number, default: 1, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const RawItemModel = mongoose.model<IRawItem>("RawItem", RawItemSchema);

// الموردين - Suppliers
export interface ISupplier extends Document {
  code: string;
  nameAr: string;
  nameEn?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  taxNumber?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>({
  code: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String },
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  taxNumber: { type: String },
  paymentTerms: { type: String },
  notes: { type: String },
  isActive: { type: Number, default: 1, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SupplierModel = mongoose.model<ISupplier>("Supplier", SupplierSchema);

// مخزون الفرع - Branch Stock
export interface IBranchStock extends Document {
  branchId: string;
  rawItemId: string;
  currentQuantity: number;
  reservedQuantity: number;
  lastUpdated: Date;
  lastCountDate?: Date;
  notes?: string;
}

const BranchStockSchema = new Schema<IBranchStock>({
  branchId: { type: String, required: true },
  rawItemId: { type: String, required: true },
  currentQuantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  lastCountDate: { type: Date },
  notes: { type: String },
});

BranchStockSchema.index({ branchId: 1, rawItemId: 1 }, { unique: true });

export const BranchStockModel = mongoose.model<IBranchStock>("BranchStock", BranchStockSchema);

// تحويلات المخزون - Stock Transfers
export interface IStockTransfer extends Document {
  transferNumber: string;
  fromBranchId: string;
  toBranchId: string;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  items: Array<{
    rawItemId: string;
    quantity: number;
    notes?: string;
  }>;
  requestedBy: string;
  approvedBy?: string;
  requestDate: Date;
  approvalDate?: Date;
  completionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferSchema = new Schema<IStockTransfer>({
  transferNumber: { type: String, required: true, unique: true },
  fromBranchId: { type: String, required: true },
  toBranchId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'in_transit', 'completed', 'cancelled'], default: 'pending', required: true },
  items: [{
    rawItemId: { type: String, required: true },
    quantity: { type: Number, required: true },
    notes: { type: String }
  }],
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  requestDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  completionDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const StockTransferModel = mongoose.model<IStockTransfer>("StockTransfer", StockTransferSchema);

// فواتير الشراء - Purchase Invoices
export interface IPurchaseInvoice extends Document {
  invoiceNumber: string;
  supplierId: string;
  branchId: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  items: Array<{
    rawItemId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    notes?: string;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  invoiceDate: Date;
  dueDate?: Date;
  receivedDate?: Date;
  receivedBy?: string;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseInvoiceSchema = new Schema<IPurchaseInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  supplierId: { type: String, required: true },
  branchId: { type: String, required: true },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'received', 'cancelled'], default: 'draft', required: true },
  items: [{
    rawItemId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    notes: { type: String }
  }],
  subtotal: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid', required: true },
  paidAmount: { type: Number, default: 0 },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  receivedDate: { type: Date },
  receivedBy: { type: String },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
  notes: { type: String },
  attachmentUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PurchaseInvoiceModel = mongoose.model<IPurchaseInvoice>("PurchaseInvoice", PurchaseInvoiceSchema);

// وصفة المنتج - Recipe (ربط المنتجات بالمواد الخام مع الكميات)
export interface IRecipeItem extends Document {
  coffeeItemId: string;
  rawItemId: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeItemSchema = new Schema<IRecipeItem>({
  coffeeItemId: { type: String, required: true },
  rawItemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RecipeItemSchema.index({ coffeeItemId: 1, rawItemId: 1 }, { unique: true });

export const RecipeItemModel = mongoose.model<IRecipeItem>("RecipeItem", RecipeItemSchema);

// تنبيهات المخزون - Stock Alerts
export interface IStockAlert extends Document {
  branchId: string;
  rawItemId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  currentQuantity: number;
  thresholdQuantity: number;
  isRead: number;
  isResolved: number;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const StockAlertSchema = new Schema<IStockAlert>({
  branchId: { type: String, required: true },
  rawItemId: { type: String, required: true },
  alertType: { type: String, enum: ['low_stock', 'out_of_stock', 'expiring_soon', 'expired'], required: true },
  currentQuantity: { type: Number, required: true },
  thresholdQuantity: { type: Number, required: true },
  isRead: { type: Number, default: 0, required: true },
  isResolved: { type: Number, default: 0, required: true },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

StockAlertSchema.index({ branchId: 1, isResolved: 1 });

export const StockAlertModel = mongoose.model<IStockAlert>("StockAlert", StockAlertSchema);

// حركات المخزون - Stock Movements (للتتبع)
export interface IStockMovement extends Document {
  branchId: string;
  rawItemId: string;
  movementType: 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'waste' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: 'purchase_invoice' | 'order' | 'transfer' | 'manual';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>({
  branchId: { type: String, required: true },
  rawItemId: { type: String, required: true },
  movementType: { type: String, enum: ['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'waste', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  referenceType: { type: String, enum: ['purchase_invoice', 'order', 'transfer', 'manual'] },
  referenceId: { type: String },
  notes: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

StockMovementSchema.index({ branchId: 1, rawItemId: 1 });
StockMovementSchema.index({ createdAt: -1 });

export const StockMovementModel = mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);

// Zod Schemas for validation
export const insertRawItemSchema = z.object({
  code: z.string(),
  nameAr: z.string(),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['ingredient', 'packaging', 'equipment', 'consumable', 'other']),
  unit: z.enum(['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag']),
  unitCost: z.number().min(0),
  minStockLevel: z.number().min(0),
  maxStockLevel: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  isActive: z.number().optional(),
});

export const insertSupplierSchema = z.object({
  code: z.string(),
  nameAr: z.string(),
  nameEn: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.number().optional(),
});

export const insertBranchStockSchema = z.object({
  branchId: z.string(),
  rawItemId: z.string(),
  currentQuantity: z.number().min(0),
  reservedQuantity: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const insertStockTransferSchema = z.object({
  fromBranchId: z.string(),
  toBranchId: z.string(),
  items: z.array(z.object({
    rawItemId: z.string(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
  })),
  requestedBy: z.string(),
  notes: z.string().optional(),
});

export const insertPurchaseInvoiceSchema = z.object({
  supplierId: z.string(),
  branchId: z.string(),
  items: z.array(z.object({
    rawItemId: z.string(),
    quantity: z.number().positive(),
    unitCost: z.number().min(0),
    totalCost: z.number().min(0),
    notes: z.string().optional(),
  })),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0),
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  createdBy: z.string(),
  notes: z.string().optional(),
});

export const insertRecipeItemSchema = z.object({
  coffeeItemId: z.string(),
  rawItemId: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  notes: z.string().optional(),
});

export const insertStockMovementSchema = z.object({
  branchId: z.string(),
  rawItemId: z.string(),
  movementType: z.enum(['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'waste', 'return']),
  quantity: z.number(),
  previousQuantity: z.number(),
  newQuantity: z.number(),
  referenceType: z.enum(['purchase_invoice', 'order', 'transfer', 'manual']).optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
});

// Type exports for inventory
export type RawItem = IRawItem;
export type InsertRawItem = z.infer<typeof insertRawItemSchema>;

export type Supplier = ISupplier;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type BranchStock = IBranchStock;
export type InsertBranchStock = z.infer<typeof insertBranchStockSchema>;

export type StockTransfer = IStockTransfer;
export type InsertStockTransfer = z.infer<typeof insertStockTransferSchema>;

export type PurchaseInvoice = IPurchaseInvoice;
export type InsertPurchaseInvoice = z.infer<typeof insertPurchaseInvoiceSchema>;

export type RecipeItem = IRecipeItem;
export type InsertRecipeItem = z.infer<typeof insertRecipeItemSchema>;

export type StockAlert = IStockAlert;

export type StockMovement = IStockMovement;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;

// Inventory category types
export type RawItemCategory = 'ingredient' | 'packaging' | 'equipment' | 'consumable' | 'other';
export type RawItemUnit = 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'box' | 'bag';
export type StockTransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
export type PurchaseInvoiceStatus = 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
export type PaymentStatusType = 'unpaid' | 'partial' | 'paid';
export type StockAlertType = 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
export type StockMovementType = 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'waste' | 'return';

// ===== ZATCA & ACCOUNTING TYPE EXPORTS =====

// Tax Invoice Types
export type TaxInvoice = ITaxInvoice;
export type InvoiceType = 'standard' | 'simplified' | 'debit_note' | 'credit_note';
export type TransactionType = 'B2B' | 'B2C';
export type ZatcaStatus = 'pending' | 'submitted' | 'accepted' | 'rejected' | 'cleared';

// Accounting Types
export type Revenue = IRevenue;
export type Expense = IExpense;
export type CashRegister = ICashRegister;
export type DailySummary = IDailySummary;
export type KitchenOrder = IKitchenOrder;

export type ExpenseCategory = 'inventory' | 'salaries' | 'rent' | 'utilities' | 'marketing' | 'maintenance' | 'supplies' | 'other';
export type ExpensePaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type RevenueCategory = 'sales' | 'delivery_fee' | 'service_charge' | 'other';
export type CashRegisterStatus = 'open' | 'closed';
export type KitchenOrderStatus = 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
export type KitchenOrderPriority = 'normal' | 'high' | 'urgent';
export type KitchenOrderType = 'dine-in' | 'takeaway' | 'delivery';

// Zod Schemas for ZATCA Invoice
export const insertTaxInvoiceSchema = z.object({
  orderId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().optional(),
  customerVatNumber: z.string().optional(),
  customerAddress: z.string().optional(),
  invoiceType: z.enum(['standard', 'simplified', 'debit_note', 'credit_note']).optional(),
  transactionType: z.enum(['B2B', 'B2C']).optional(),
  items: z.array(z.object({
    itemId: z.string(),
    nameAr: z.string(),
    nameEn: z.string().optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    discountAmount: z.number().optional(),
    taxRate: z.number().optional(),
  })),
  paymentMethod: z.string(),
  branchId: z.string().optional(),
  createdBy: z.string().optional(),
});

export type InsertTaxInvoice = z.infer<typeof insertTaxInvoiceSchema>;

// Zod Schemas for Accounting
export const insertExpenseSchema = z.object({
  branchId: z.string(),
  date: z.coerce.date(),
  category: z.enum(['inventory', 'salaries', 'rent', 'utilities', 'marketing', 'maintenance', 'supplies', 'other']),
  subcategory: z.string().optional(),
  description: z.string(),
  amount: z.number().positive(),
  vatAmount: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'check', 'other']),
  vendorName: z.string().optional(),
  vendorVatNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  createdBy: z.string(),
  notes: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export const insertRevenueSchema = z.object({
  branchId: z.string(),
  date: z.coerce.date(),
  orderId: z.string().optional(),
  invoiceId: z.string().optional(),
  category: z.enum(['sales', 'delivery_fee', 'service_charge', 'other']).optional(),
  description: z.string().optional(),
  grossAmount: z.number(),
  vatAmount: z.number(),
  netAmount: z.number(),
  paymentMethod: z.string(),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

export const insertCashRegisterSchema = z.object({
  branchId: z.string(),
  employeeId: z.string(),
  openingBalance: z.number().min(0),
});

export type InsertCashRegister = z.infer<typeof insertCashRegisterSchema>;

export const insertKitchenOrderSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  branchId: z.string(),
  items: z.array(z.object({
    itemId: z.string(),
    nameAr: z.string(),
    quantity: z.number(),
    notes: z.string().optional(),
  })),
  priority: z.enum(['normal', 'high', 'urgent']).optional(),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']),
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertKitchenOrder = z.infer<typeof insertKitchenOrderSchema>;

// Employee Role Types (including new roles)
export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'driver' | 'barista' | 'cook' | 'waiter';
