import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCartItemSchema, insertEmployeeSchema, type PaymentMethod } from "@shared/schema";
import { requireAuth, requireManager, requireAdmin, filterByBranch, type AuthRequest } from "./middleware/auth";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

// Helper function to serialize MongoDB documents
function serializeDoc(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Only set id from _id if there's no existing id field
  if (obj._id && !obj.id) {
    obj.id = obj._id.toString();
  }
  
  // Always clean up MongoDB internal fields
  delete obj._id;
  delete obj.__v;
  return obj;
}

// Helper function to send WhatsApp notification
function getOrderStatusMessage(status: string, orderNumber: string): string {
  const statusMessages: Record<string, string> = {
    'pending': `⏳ طلبك رقم ${orderNumber} في الانتظار\nنحن نستعد لتجهيزه!`,
    'payment_confirmed': `💰 تم تأكيد دفع طلبك رقم ${orderNumber}\nجاري تحضيره الآن!`,
    'in_progress': `☕ طلبك رقم ${orderNumber} قيد التحضير الآن\nقهوتك في الطريق!`,
    'ready': `🎉 طلبك رقم ${orderNumber} جاهز للاستلام!\nاستمتع بقهوتك ☕`,
    'completed': `✅ تم استلام طلبك رقم ${orderNumber}\nنتمنى أن تستمتع بقهوتك!`,
    'cancelled': `❌ تم إلغاء طلبك رقم ${orderNumber}\nنأسف للإزعاج`
  };
  return statusMessages[status] || `تم تحديث حالة طلبك رقم ${orderNumber} إلى: ${status}`;
}

// Configure multer for file uploads
const uploadsDir = path.join(import.meta.dirname, '..', 'attached_assets', 'receipts');
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${nanoid(8)}`;
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (ext && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPG, PNG, WEBP) and PDF are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // FILE UPLOAD ROUTES
  
  // Upload payment receipt
  app.post("/api/upload-receipt", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/attached_assets/receipts/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // EMPLOYEE ROUTES

  // Employee login
  app.post("/api/employees/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const employee = await storage.getEmployeeByUsername(username);

      if (!employee || !employee.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session
      req.session.employee = {
        id: employee.id,
        username: employee.username,
        role: employee.role,
        branchId: employee.branchId,
        fullName: employee.fullName,
      };

      // Don't send password back
      const { password: _, ...employeeData} = employee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error during employee login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get employee by ID (branch-restricted for managers)
  app.get("/api/employees/:id", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(id);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Verify branch access for non-admin managers
      if (req.employee?.role !== "admin" && employee.branchId !== req.employee?.branchId) {
        return res.status(403).json({ error: "Access denied - different branch" });
      }

      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  // Create new employee (admin only)
  app.post("/api/employees", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);

      // Check if username already exists
      const existing = await storage.getEmployeeByUsername(validatedData.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const employee = await storage.createEmployee(validatedData);

      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.status(201).json(employeeData);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  // Get all employees (branch-filtered for managers)
  app.get("/api/employees", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const allEmployees = await storage.getEmployees();

      // Filter by branch for non-admin managers
      const employees = filterByBranch(allEmployees, req.employee);

      // Don't send passwords back
      const employeesData = employees.map(emp => {
        const { password: _, ...data } = emp;
        return data;
      });

      res.json(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  // Get active cashiers (branch-filtered for managers)
  app.get("/api/employees/active-cashiers", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const allCashiers = await storage.getActiveCashiers();

      // Filter by branch for non-admin managers
      const cashiers = filterByBranch(allCashiers, req.employee);

      // Don't send passwords back
      const cashiersData = cashiers.map(emp => {
        const { password: _, ...data } = emp;
        return data;
      });

      res.json(cashiersData);
    } catch (error) {
      console.error("Error fetching active cashiers:", error);
      res.status(500).json({ error: "Failed to fetch active cashiers" });
    }
  });

  // Update employee (branch-restricted for managers)
  app.put("/api/employees/:id", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Get employee to verify branch access
      const existingEmployee = await storage.getEmployee(id);
      if (!existingEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Verify branch access for non-admin managers
      if (req.employee?.role !== "admin" && existingEmployee.branchId !== req.employee?.branchId) {
        return res.status(403).json({ error: "Access denied - different branch" });
      }

      const updatedEmployee = await storage.updateEmployee(id, updates);

      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Don't send password back
      const { password: _, ...employeeData } = updatedEmployee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  // Activate employee account
  app.post("/api/employees/activate", async (req, res) => {
    try {
      const { phone, fullName, password } = req.body;

      if (!phone || !fullName || !password) {
        return res.status(400).json({ error: "رقم الهاتف والاسم وكلمة المرور مطلوبة" });
      }

      const employee = await storage.activateEmployee(phone, fullName, password);

      if (!employee) {
        return res.status(404).json({ error: "الموظف غير موجود أو تم تفعيله مسبقاً" });
      }

      // Don't send password back
      const { password: _, ...employeeData } = employee;
      res.json(employeeData);
    } catch (error) {
      console.error("Error activating employee:", error);
      res.status(500).json({ error: "Failed to activate employee" });
    }
  });

  // DISCOUNT CODE ROUTES

  // Create discount code
  app.post("/api/discount-codes", async (req, res) => {
    try {
      const { insertDiscountCodeSchema } = await import("@shared/schema");
      const validatedData = insertDiscountCodeSchema.parse(req.body);

      // Check if code already exists
      const existing = await storage.getDiscountCodeByCode(validatedData.code);
      if (existing) {
        return res.status(400).json({ error: "Code already exists" });
      }

      const discountCode = await storage.createDiscountCode(validatedData);
      res.status(201).json(discountCode);
    } catch (error) {
      console.error("Error creating discount code:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error });
      }
      res.status(500).json({ error: "Failed to create discount code" });
    }
  });

  // Get discount code by code
  app.get("/api/discount-codes/by-code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const discountCode = await storage.getDiscountCodeByCode(code);

      if (!discountCode) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (discountCode.isActive === 0) {
        return res.status(400).json({ error: "Discount code is inactive" });
      }

      res.json(discountCode);
    } catch (error) {
      console.error("Error fetching discount code:", error);
      res.status(500).json({ error: "Failed to fetch discount code" });
    }
  });

  // Get all discount codes for an employee
  app.get("/api/discount-codes/employee/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const codes = await storage.getDiscountCodesByEmployee(employeeId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching employee discount codes:", error);
      res.status(500).json({ error: "Failed to fetch discount codes" });
    }
  });

  // Update discount code (toggle active status only)
  app.patch("/api/discount-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, employeeId } = req.body;

      // Require employee ID for authorization
      if (!employeeId) {
        return res.status(401).json({ error: "Employee authentication required" });
      }

      // Verify the discount code exists and belongs to this employee
      const existingCode = await storage.getDiscountCode(id);
      if (!existingCode) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (existingCode.employeeId !== employeeId) {
        return res.status(403).json({ error: "Unauthorized: You can only update your own discount codes" });
      }

      // Only allow updating isActive field
      if (typeof isActive !== 'number' || (isActive !== 0 && isActive !== 1)) {
        return res.status(400).json({ error: "Only isActive field can be updated (0 or 1)" });
      }

      const discountCode = await storage.updateDiscountCode(id, { isActive });
      res.json(discountCode);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ error: "Failed to update discount code" });
    }
  });

  // Increment discount code usage
  app.post("/api/discount-codes/:id/use", async (req, res) => {
    try {
      const { id } = req.params;

      // Check if code exists and is active first
      const code = await storage.getDiscountCode(id);
      if (!code) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      if (code.isActive === 0) {
        return res.status(400).json({ error: "Discount code is inactive" });
      }

      const discountCode = await storage.incrementDiscountCodeUsage(id);
      res.json(discountCode);
    } catch (error) {
      console.error("Error incrementing discount code usage:", error);
      res.status(500).json({ error: "Failed to use discount code" });
    }
  });

  // Validate discount code and return discount info
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Discount code is required" });
      }

      const discountCode = await storage.getDiscountCodeByCode(code.trim());

      if (!discountCode) {
        return res.status(404).json({ 
          valid: false,
          error: "كود الخصم غير موجود"
        });
      }

      if (discountCode.isActive === 0) {
        return res.status(400).json({ 
          valid: false,
          error: "كود الخصم غير فعال"
        });
      }

      res.json({
        valid: true,
        code: discountCode.code,
        discountPercentage: discountCode.discountPercentage,
        reason: discountCode.reason,
        id: discountCode._id
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ error: "Failed to validate discount code" });
    }
  });

  // SALES REPORTS ROUTES

  // Get sales report for a specific period
  app.get("/api/reports/sales", async (req, res) => {
    try {
      const { period, startDate, endDate, branchId } = req.query;
      
      const now = new Date();
      let start: Date;
      let end: Date = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else if (period === 'daily') {
        start = new Date(now.setHours(0, 0, 0, 0));
      } else if (period === 'weekly') {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        start = new Date(now.setHours(0, 0, 0, 0));
      }

      const { OrderModel } = await import("@shared/schema");
      
      const matchQuery: any = {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['completed', 'payment_confirmed'] }
      };

      if (branchId) {
        matchQuery.branchId = branchId;
      }

      const salesData = await OrderModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            orders: { $push: "$$ROOT" }
          }
        }
      ]);

      const result = salesData[0] || { totalOrders: 0, totalRevenue: 0, orders: [] };

      res.json({
        period: period || 'custom',
        startDate: start,
        endDate: end,
        totalOrders: result.totalOrders,
        totalRevenue: result.totalRevenue,
        orders: result.orders
      });
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ error: "Failed to generate sales report" });
    }
  });

  // CUSTOMER ROUTES

  // Customer registration - إنشاء حساب جديد
  app.post("/api/customers/register", async (req, res) => {
    try {
      const { phone, email, name, password } = req.body;

      if (!phone || !email || !name || !password) {
        return res.status(400).json({ error: "الهاتف والبريد الإلكتروني والاسم وكلمة المرور مطلوبة" });
      }

      // Validate phone format: must be 9 digits starting with 5
      const cleanPhone = phone.trim().replace(/\s/g, '');
      if (cleanPhone.length !== 9) {
        return res.status(400).json({ error: "رقم الهاتف يجب أن يكون 9 أرقام" });
      }

      if (!cleanPhone.startsWith('5')) {
        return res.status(400).json({ error: "رقم الهاتف يجب أن يبدأ بـ 5" });
      }

      if (!/^5\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: "صيغة رقم الهاتف غير صحيحة" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
      }

      // Validate name
      if (name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم يجب أن يكون على الأقل حرفين" });
      }

      // Validate password
      if (password.length < 4) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون على الأقل 4 أحرف" });
      }

      // Check if customer already exists with this phone
      const existingCustomerByPhone = await storage.getCustomerByPhone(cleanPhone);
      if (existingCustomerByPhone) {
        return res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
      }

      // Check if customer already exists with this email
      const existingCustomerByEmail = await storage.getCustomerByEmail(email);
      if (existingCustomerByEmail) {
        return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
      }

      // Create new customer
      const customer = await storage.createCustomer({ 
        phone: cleanPhone, 
        email: email.trim(),
        name: name.trim(),
        password 
      });

      // Create loyalty card for new customer
      try {
        await storage.createLoyaltyCard({ 
          customerName: name.trim(), 
          phoneNumber: cleanPhone 
        });
      } catch (cardError) {
        console.error("Error creating loyalty card for new customer:", cardError);
        // Don't fail registration if card creation fails
      }

      // Serialize and don't send password back
      const serialized = serializeDoc(customer);
      const { password: _, ...customerData } = serialized;
      res.status(201).json(customerData);
    } catch (error) {
      console.error("Error during customer registration:", error);
      res.status(500).json({ error: "فشل إنشاء الحساب" });
    }
  });

  // Customer login - تسجيل دخول
  app.post("/api/customers/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: "رقم الهاتف أو البريد الإلكتروني وكلمة المرور مطلوبة" });
      }

      const cleanIdentifier = identifier.trim().replace(/\s/g, '');
      let customer;

      // Check if identifier is email or phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let foundCustomer;
      
      if (emailRegex.test(cleanIdentifier)) {
        // Login with email
        foundCustomer = await storage.getCustomerByEmail(cleanIdentifier);
        if (foundCustomer) {
          if (!foundCustomer.password) {
            // Customer exists but has no password (cashier-registered)
            return res.status(403).json({ 
              error: "هذا الحساب تم تسجيله من قبل الكاشير ولا يحتوي على كلمة مرور. يرجى إنشاء كلمة مرور أولاً",
              message: "This account was registered by cashier and has no password. Please set up a password first",
              requiresPasswordSetup: true
            });
          }
          const isPasswordValid = await bcrypt.compare(password, foundCustomer.password);
          if (isPasswordValid) {
            customer = foundCustomer;
          }
        }
      } else {
        // Login with phone
        if (!/^5\d{8}$/.test(cleanIdentifier)) {
          return res.status(400).json({ error: "صيغة رقم الهاتف أو البريد الإلكتروني غير صحيحة" });
        }
        
        foundCustomer = await storage.getCustomerByPhone(cleanIdentifier);
        if (foundCustomer) {
          if (!foundCustomer.password) {
            // Customer exists but has no password (cashier-registered)
            return res.status(403).json({ 
              error: "هذا الحساب تم تسجيله من قبل الكاشير ولا يحتوي على كلمة مرور. يرجى إنشاء كلمة مرور أولاً",
              message: "This account was registered by cashier and has no password. Please set up a password first",
              requiresPasswordSetup: true
            });
          }
          customer = await storage.verifyCustomerPassword(cleanIdentifier, password);
        }
      }

      if (!customer) {
        return res.status(401).json({ error: "رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Serialize and don't send password back
      const serialized = serializeDoc(customer);
      const { password: _, ...customerData } = serialized;
      res.json(customerData);
    } catch (error) {
      console.error("Error during customer login:", error);
      res.status(500).json({ error: "فشل تسجيل الدخول" });
    }
  });

  // Request password reset - طلب إعادة تعيين كلمة المرور
  app.post("/api/customers/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
      }

      // Check if customer exists
      const customer = await storage.getCustomerByEmail(email);
      
      // Always return success to prevent email enumeration
      // But only create token if customer exists
      if (customer) {
        const { token, expiresAt } = await storage.createPasswordResetToken(email);
        
        // TODO: Send email with reset token
        // For now, log the token to console (development only)
        console.log(`Password reset token for ${email}: ${token}`);
        console.log(`Token expires at: ${expiresAt}`);
        console.log(`Reset URL: /reset-password?token=${token}`);
      }

      res.json({ 
        message: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور" 
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ error: "فشل طلب إعادة تعيين كلمة المرور" });
    }
  });

  // Verify password reset token - التحقق من رمز إعادة التعيين
  app.post("/api/customers/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "الرمز مطلوب" });
      }

      const result = await storage.verifyPasswordResetToken(token);

      if (!result.valid) {
        return res.status(400).json({ error: "الرمز غير صالح أو منتهي الصلاحية" });
      }

      res.json({ valid: true, email: result.email });
    } catch (error) {
      console.error("Error verifying reset token:", error);
      res.status(500).json({ error: "فشل التحقق من الرمز" });
    }
  });

  // Reset password - إعادة تعيين كلمة المرور
  app.post("/api/customers/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "الرمز وكلمة المرور الجديدة مطلوبة" });
      }

      // Validate password
      if (newPassword.length < 4) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون على الأقل 4 أحرف" });
      }

      // Verify token
      const verification = await storage.verifyPasswordResetToken(token);
      
      if (!verification.valid || !verification.email) {
        return res.status(400).json({ error: "الرمز غير صالح أو منتهي الصلاحية" });
      }

      // Reset password
      const success = await storage.resetCustomerPassword(verification.email, newPassword);
      
      if (!success) {
        return res.status(500).json({ error: "فشل إعادة تعيين كلمة المرور" });
      }

      // Mark token as used
      await storage.usePasswordResetToken(token);

      res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "فشل إعادة تعيين كلمة المرور" });
    }
  });

  // Check if email exists - التحقق من وجود البريد الإلكتروني
  app.post("/api/customers/check-email", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
      }

      const customer = await storage.getCustomerByEmail(email);
      res.json({ exists: !!customer });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ error: "فشل التحقق من البريد الإلكتروني" });
    }
  });

  // Verify phone matches email - التحقق من تطابق رقم الجوال مع البريد
  app.post("/api/customers/verify-phone-email", async (req, res) => {
    try {
      const { email, phone } = req.body;

      if (!email || !phone) {
        return res.status(400).json({ error: "البريد الإلكتروني ورقم الجوال مطلوبان" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      const customer = await storage.getCustomerByEmail(email);

      if (!customer) {
        return res.json({ valid: false });
      }

      const valid = customer.phone === cleanPhone;
      res.json({ valid });
    } catch (error) {
      console.error("Error verifying phone-email match:", error);
      res.status(500).json({ error: "فشل التحقق من البيانات" });
    }
  });

  // Reset password directly with email and phone - إعادة تعيين كلمة المرور مباشرة
  app.post("/api/customers/reset-password-direct", async (req, res) => {
    try {
      const { email, phone, newPassword } = req.body;

      if (!email || !phone || !newPassword) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون على الأقل 4 أحرف" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      const customer = await storage.getCustomerByEmail(email);

      if (!customer || customer.phone !== cleanPhone) {
        return res.status(400).json({ error: "البيانات غير صحيحة" });
      }

      const success = await storage.resetCustomerPassword(email, newPassword);
      
      if (!success) {
        return res.status(500).json({ error: "فشل إعادة تعيين كلمة المرور" });
      }

      res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error resetting password directly:", error);
      res.status(500).json({ error: "فشل إعادة تعيين كلمة المرور" });
    }
  });

  // Customer authentication (legacy - for backward compatibility)
  app.post("/api/customers/auth", async (req, res) => {
    try {
      const { phone, name, password } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
      }

      // Validate phone format
      const cleanPhone = phone.trim().replace(/\s/g, '');
      if (!/^5\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }

      // If password provided, try login first
      if (password) {
        const customer = await storage.verifyCustomerPassword(cleanPhone, password);
        if (customer) {
          const { password: _, ...customerData } = customer;
          return res.json(customerData);
        }
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Legacy behavior: get or create customer without password
      let customer = await storage.getCustomerByPhone(cleanPhone);
      if (customer) {
        const { password: _, ...customerData } = customer;
        return res.json(customerData);
      }

      // For new registrations, require password
      return res.status(400).json({ error: "Please use /api/customers/register for new accounts" });
    } catch (error) {
      console.error("Error during customer auth:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Get all customers (for admin/manager dashboard)
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      const serializedCustomers = customers.map(customer => {
        const { password, ...customerData} = customer.toObject ? customer.toObject() : customer;
        return serializeDoc(customerData);
      });
      res.json(serializedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  /* 
   * CASHIER-REGISTERED CUSTOMERS - العملاء المسجلين من الكاشير
   * 
   * Customers registered by cashiers don't have passwords initially.
   * They can't log in through the normal /api/customers/login flow.
   * 
   * When they order via QR code (table menu), they just enter their phone number
   * and the system automatically links the order to their account for loyalty tracking.
   * 
   * They can optionally set a password later using /api/customers/set-password
   * to gain full account access with login capability.
   */
  
  // Customer lookup by phone for cashier - البحث عن عميل برقم الجوال من الكاشير
  app.post("/api/customers/lookup-by-phone", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "رقم الجوال مطلوب" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      
      const customer = await storage.getCustomerByPhone(cleanPhone);
      
      if (!customer) {
        return res.json({ found: false });
      }

      const loyaltyCard = await storage.getLoyaltyCardByPhone(cleanPhone);

      const { password: _, ...customerData } = customer.toObject ? customer.toObject() : customer;
      const serializedCustomer = serializeDoc(customerData);

      res.json({ 
        found: true,
        customer: serializedCustomer,
        loyaltyCard: loyaltyCard ? serializeDoc(loyaltyCard) : null
      });
    } catch (error) {
      console.error("Error looking up customer by phone:", error);
      res.status(500).json({ error: "فشل البحث عن العميل" });
    }
  });

  // Quick customer registration by cashier - تسجيل عميل سريع من الكاشير
  app.post("/api/customers/register-by-cashier", async (req, res) => {
    try {
      const { phone, name, email } = req.body;

      if (!phone || !name) {
        return res.status(400).json({ error: "رقم الجوال والاسم مطلوبان" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      const cleanName = name.trim();
      const cleanEmail = email ? email.trim() : undefined;

      if (cleanName.length < 2) {
        return res.status(400).json({ error: "الاسم يجب أن يكون على الأقل حرفين" });
      }

      if (!/^5\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: "صيغة رقم الهاتف غير صحيحة" });
      }

      // Validate email format if provided
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });
      }

      const existingCustomer = await storage.getCustomerByPhone(cleanPhone);
      if (existingCustomer) {
        return res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
      }

      // Check if email already exists
      if (cleanEmail) {
        const existingEmailCustomer = await storage.getCustomerByEmail(cleanEmail);
        if (existingEmailCustomer) {
          return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
        }
      }

      const customer = await storage.createCustomer({ 
        phone: cleanPhone, 
        name: cleanName,
        email: cleanEmail,
        registeredBy: 'cashier'
      });

      try {
        await storage.createLoyaltyCard({ 
          customerName: cleanName, 
          phoneNumber: cleanPhone 
        });
      } catch (cardError) {
        console.error("Error creating loyalty card for cashier-registered customer:", cardError);
      }

      const { password: _, ...customerData } = customer;
      const serialized = serializeDoc(customerData);
      res.status(201).json(serialized);
    } catch (error) {
      console.error("Error registering customer by cashier:", error);
      res.status(500).json({ error: "فشل تسجيل العميل" });
    }
  });

  /*
   * PASSWORDLESS CUSTOMER PASSWORD SETUP FLOW
   * 
   * For security, customers must verify phone ownership via OTP before setting password.
   * This prevents unauthorized password changes even if someone knows the customer's phone number.
   * 
   * Flow:
   * 1. POST /api/customers/request-password-setup-otp { phone }
   *    - Generates and stores OTP for the customer's phone
   *    - In production, sends SMS with OTP
   *    - Returns success (doesn't reveal if phone exists for security)
   * 
   * 2. POST /api/customers/set-password { phone, otp, password }
   *    - Verifies OTP matches and hasn't expired
   *    - Sets password only if OTP is valid
   *    - Prevents setting password if customer already has one
   */

  // Step 1: Request OTP to set password
  app.post("/api/customers/request-password-setup-otp", async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "رقم الجوال مطلوب" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      
      if (!/^5\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: "صيغة رقم الهاتف غير صحيحة" });
      }

      const customer = await storage.getCustomerByPhone(cleanPhone);
      
      // Always return success to prevent phone enumeration
      // But only generate OTP if customer exists and has no password
      if (customer && !customer.password) {
        try {
          const { otp, expiresAt } = await storage.createPasswordSetupOTP(cleanPhone);
          
          // Log OTP for development (in production: send SMS via Twilio/etc)
          console.log(`OTP for ${cleanPhone}: ${otp} (expires at ${expiresAt.toISOString()})`);
          
          // TODO PRODUCTION: Send SMS with OTP
          // await twilioClient.messages.create({
          //   body: `رمز التحقق الخاص بك: ${otp}`,
          //   to: '+966' + cleanPhone,
          //   from: process.env.TWILIO_PHONE_NUMBER
          // });
        } catch (otpError: any) {
          // If rate limit exceeded, return specific error
          if (otpError.message.includes('تجاوز الحد')) {
            return res.status(429).json({ error: otpError.message });
          }
          throw otpError;
        }
      }

      res.json({ 
        success: true,
        message: "إذا كان الرقم مسجلاً، سيتم إرسال رمز التحقق خلال دقائق",
        message_en: "If the number is registered, verification code will be sent within minutes"
      });
    } catch (error) {
      console.error("Error requesting password setup OTP:", error);
      res.status(500).json({ error: "فشل إرسال رمز التحقق" });
    }
  });

  // Step 2: Verify OTP and set password
  app.post("/api/customers/set-password", async (req, res) => {
    try {
      const { phone, otp, password } = req.body;

      if (!phone || !otp || !password) {
        return res.status(400).json({ error: "رقم الجوال، رمز التحقق وكلمة المرور مطلوبة" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      
      if (password.length < 8) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      }

      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ error: "رمز التحقق غير صحيح" });
      }

      const customer = await storage.getCustomerByPhone(cleanPhone);
      if (!customer) {
        return res.status(404).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }

      // Prevent overwriting existing passwords
      if (customer.password) {
        return res.status(400).json({ 
          error: "هذا الحساب لديه كلمة مرور بالفعل. يرجى استخدام ميزة إعادة تعيين كلمة المرور",
          message: "Account already has a password. Use password reset instead"
        });
      }

      // Verify OTP from database
      const otpVerification = await storage.verifyPasswordSetupOTP(cleanPhone, otp);
      if (!otpVerification.valid) {
        return res.status(400).json({ error: otpVerification.message || "رمز التحقق غير صحيح" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update customer with password
      const updated = await storage.updateCustomer((customer as any)._id.toString(), { 
        password: hashedPassword 
      });

      if (!updated) {
        return res.status(500).json({ error: "فشل تحديث كلمة المرور" });
      }

      // Invalidate the used OTP
      await storage.invalidatePasswordSetupOTP(cleanPhone, otp);

      const { password: _, ...customerData } = updated;
      res.json({ 
        success: true, 
        message: "تم تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول",
        customer: serializeDoc(customerData)
      });
    } catch (error) {
      console.error("Error setting customer password:", error);
      res.status(500).json({ error: "فشل تعيين كلمة المرور" });
    }
  });

  // Get customer by ID
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // Update customer
  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, carType, carColor, saveCarInfo } = req.body;

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (carType !== undefined) updates.carType = carType;
      if (carColor !== undefined) updates.carColor = carColor;
      if (saveCarInfo !== undefined) updates.saveCarInfo = saveCarInfo;

      const customer = await storage.updateCustomer(id, updates);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(serializeDoc(customer));
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // Get customer orders
  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const { id } = req.params;
      const orders = await storage.getCustomerOrders(id);
      
      // Process orders to ensure items is always an array
      const processedOrders = orders.map(order => {
        const serializedOrder = serializeDoc(order);
        
        // Parse items if they're stored as JSON string
        let orderItems = serializedOrder.items;
        if (typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch (e) {
            console.error("Error parsing order items:", e);
            orderItems = [];
          }
        }
        
        // Ensure orderItems is an array
        if (!Array.isArray(orderItems)) {
          orderItems = [];
        }
        
        return {
          ...serializedOrder,
          items: orderItems
        };
      });
      
      res.json(processedOrders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // COFFEE ROUTES

  // Get all coffee items
  app.get("/api/coffee-items", async (req, res) => {
    try {
      const items = await storage.getCoffeeItems();
      res.json(items.map(serializeDoc));
    } catch (error) {
      console.error("Error fetching coffee items:", error);
      res.status(500).json({ error: "Failed to fetch coffee items" });
    }
  });

  // Create new coffee item (manager only)
  app.post("/api/coffee-items", async (req, res) => {
    try {
      const { insertCoffeeItemSchema } = await import("@shared/schema");
      const validatedData = insertCoffeeItemSchema.parse(req.body);

      const item = await storage.createCoffeeItem(validatedData);
      res.status(201).json(serializeDoc(item));
    } catch (error) {
      console.error("Error creating coffee item:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create coffee item" });
    }
  });

  // Get coffee items by category
  app.get("/api/coffee-items/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getCoffeeItemsByCategory(category);
      res.json(items);
    } catch (error) {
      console.error("Error fetching coffee items by category:", error);
      res.status(500).json({ error: "Failed to fetch coffee items by category" });
    }
  });

  // Get specific coffee item
  app.get("/api/coffee-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getCoffeeItem(id);
      if (!item) {
        return res.status(404).json({ error: "Coffee item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching coffee item:", error);
      res.status(500).json({ error: "Failed to fetch coffee item" });
    }
  });

  // Update coffee item availability (for employees)
  app.patch("/api/coffee-items/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable, availabilityStatus } = req.body;

      const item = await storage.getCoffeeItem(id);
      if (!item) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      const updates: any = {};
      
      if (typeof isAvailable === 'number' && (isAvailable === 0 || isAvailable === 1)) {
        updates.isAvailable = isAvailable;
      }
      
      if (availabilityStatus) {
        const validStatuses = ['available', 'out_of_stock', 'coming_soon', 'temporarily_unavailable'];
        if (!validStatuses.includes(availabilityStatus)) {
          return res.status(400).json({ error: "Invalid availability status" });
        }
        updates.availabilityStatus = availabilityStatus;
        // Auto-update isAvailable based on status
        updates.isAvailable = availabilityStatus === 'available' ? 1 : 0;
      }

      const updatedItem = await storage.updateCoffeeItem(id, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating coffee item availability:", error);
      res.status(500).json({ error: "Failed to update coffee item availability" });
    }
  });

  // Update complete coffee item (for manager)
  app.put("/api/coffee-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getCoffeeItem(id);
      
      if (!item) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      const updatedItem = await storage.updateCoffeeItem(id, req.body);
      res.json(serializeDoc(updatedItem));
    } catch (error) {
      console.error("Error updating coffee item:", error);
      res.status(500).json({ error: "Failed to update coffee item" });
    }
  });

  // Delete coffee item (for manager)
  app.delete("/api/coffee-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCoffeeItem(id);
      
      if (!success) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      res.json({ success: true, message: "Coffee item deleted successfully" });
    } catch (error) {
      console.error("Error deleting coffee item:", error);
      res.status(500).json({ error: "Failed to delete coffee item" });
    }
  });

  // Get cart items for session - OPTIMIZED
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getCartItems(sessionId);

      if (cartItems.length === 0) {
        return res.json([]);
      }

      // Get all coffee items once instead of multiple queries
      const allCoffeeItems = await storage.getCoffeeItems();
      const coffeeItemsMap = new Map(allCoffeeItems.map(item => [item.id, serializeDoc(item)]));

      // Enrich cart items with coffee details efficiently
      const enrichedItems = cartItems.map((cartItem) => {
        const serializedCart = serializeDoc(cartItem);
        return {
          ...serializedCart,
          coffeeItem: coffeeItemsMap.get(cartItem.coffeeItemId)
        };
      }).filter(item => item.coffeeItem); // Filter out items where coffee doesn't exist

      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);

      // Verify coffee item exists
      const coffeeItem = await storage.getCoffeeItem(validatedData.coffeeItemId);
      if (!coffeeItem) {
        return res.status(404).json({ error: "Coffee item not found" });
      }

      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(serializeDoc(cartItem));
    } catch (error) {
      console.error("Error adding item to cart:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:sessionId/:coffeeItemId", async (req, res) => {
    try {
      const { sessionId, coffeeItemId } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(sessionId, coffeeItemId, quantity);
      if (!updatedItem && quantity > 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem ? serializeDoc(updatedItem) : { message: "Item removed from cart" });
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      res.status(500).json({ error: "Failed to update cart item quantity" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:sessionId/:coffeeItemId", async (req, res) => {
    try {
      const { sessionId, coffeeItemId } = req.params;
      const removed = await storage.removeFromCart(sessionId, coffeeItemId);

      if (!removed) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  // Clear entire cart
  app.delete("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const { 
        items, totalAmount, paymentMethod, paymentDetails, paymentReceiptUrl,
        customerInfo, customerId, customerNotes, freeItemsDiscount, usedFreeDrinks, 
        discountCode, discountPercentage,
        deliveryType, deliveryAddress, deliveryFee, branchId,
        tableNumber, tableId, orderType
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items are required" });
      }

      if (!totalAmount || isNaN(parseFloat(totalAmount))) {
        return res.status(400).json({ error: "Valid total amount is required" });
      }

      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }

      if (!customerInfo?.customerName) {
        return res.status(400).json({ error: "Customer name is required" });
      }

      // Validate payment receipt for electronic payment methods
      const electronicPaymentMethods = ['alinma', 'ur', 'barq', 'rajhi'];
      if (electronicPaymentMethods.includes(paymentMethod) && !paymentReceiptUrl) {
        return res.status(400).json({ error: "Payment receipt is required for electronic payment methods" });
      }

      // Validate delivery data when deliveryType is 'delivery'
      if (deliveryType === 'delivery') {
        if (!deliveryAddress || !deliveryAddress.lat || !deliveryAddress.lng) {
          return res.status(400).json({ error: "Delivery address with coordinates is required for delivery orders" });
        }
        if (deliveryFee === undefined || deliveryFee === null) {
          return res.status(400).json({ error: "Delivery fee is required for delivery orders" });
        }
      }

      // Get or create customer if phone number provided
      let finalCustomerId = customerId;

      if (customerInfo.phoneNumber && !customerId) {
        try {
          const existingCustomer = await storage.getCustomerByPhone(customerInfo.phoneNumber);
          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
          }
        } catch (error) {
          console.log("Customer lookup failed, will create new order without customer ID");
        }
      }

      // Validate usedFreeDrinks
      const validatedUsedFreeDrinks = typeof usedFreeDrinks === 'number' ? usedFreeDrinks : 0;
      const validatedFreeItemsDiscount = freeItemsDiscount || "0.00";

      // If using qahwa-card payment method (free drinks), update loyalty card
      if (paymentMethod === 'qahwa-card' && finalCustomerId && validatedUsedFreeDrinks > 0) {
        try {
          // Get customer's loyalty card
          const customer = await storage.getCustomer(finalCustomerId);
          if (customer?.phone) {
            const loyaltyCard = await storage.getLoyaltyCardByPhone(customer.phone);
            if (loyaltyCard) {
              // Check if customer has enough free drinks
              const availableFreeDrinks = loyaltyCard.freeCupsEarned - loyaltyCard.freeCupsRedeemed;
              if (availableFreeDrinks < validatedUsedFreeDrinks) {
                return res.status(400).json({ 
                  error: `ليس لديك مشروبات مجانية كافية. المتاح: ${availableFreeDrinks}` 
                });
              }

              // Update freeCupsRedeemed
              await storage.updateLoyaltyCard(loyaltyCard.id, {
                freeCupsRedeemed: loyaltyCard.freeCupsRedeemed + validatedUsedFreeDrinks,
                lastUsedAt: new Date()
              });

              // Create loyalty transaction
              await storage.createLoyaltyTransaction({
                cardId: loyaltyCard.id,
                type: 'free_cup_redeemed',
                pointsChange: 0,
                discountAmount: validatedFreeItemsDiscount,
                orderAmount: totalAmount,
                description: `استخدام ${validatedUsedFreeDrinks} مشروب مجاني`,
              });
            }
          }
        } catch (error) {
          console.error("Error updating loyalty card:", error);
          return res.status(500).json({ error: "فشل في تحديث بطاقة الولاء" });
        }
      }

      // Validate and increment discount code usage if provided
      if (discountCode && discountPercentage) {
        try {
          const discountCodeDoc = await storage.getDiscountCodeByCode(discountCode);
          if (discountCodeDoc && discountCodeDoc.isActive === 1 && discountCodeDoc.discountPercentage === discountPercentage) {
            // Increment usage counter
            await storage.incrementDiscountCodeUsage(discountCodeDoc.id);
          }
        } catch (error) {
          console.error("Error processing discount code:", error);
          // Continue with order creation even if discount tracking fails
        }
      }

      // Create order
      const orderData: any = {
        customerId: finalCustomerId || null,
        totalAmount,
        paymentMethod,
        paymentDetails,
        paymentReceiptUrl: paymentReceiptUrl || null,
        customerInfo,
        customerNotes,
        discountCode: discountCode || null,
        discountPercentage: discountPercentage || null,
        deliveryType: deliveryType || null,
        deliveryAddress: deliveryAddress || null,
        deliveryFee: deliveryFee || 0,
        branchId: branchId || null,
        tableNumber: tableNumber || null,
        tableId: tableId || null,
        orderType: orderType || (tableNumber || tableId ? 'table' : 'regular'),
        items: JSON.stringify(items)
      };

      const order = await storage.createOrder(orderData);

      // Add stamps automatically if customer has loyalty card
      if (finalCustomerId) {
        try {
          const customer = await storage.getCustomer(finalCustomerId);
          if (customer?.phone) {
            let loyaltyCard = await storage.getLoyaltyCardByPhone(customer.phone);

            // Create loyalty card if doesn't exist
            if (!loyaltyCard) {
              loyaltyCard = await storage.createLoyaltyCard({
                customerName: customerInfo.customerName,
                phoneNumber: customer.phone
              });
            }

            // Calculate stamps (1 stamp per drink, but not for free drinks used)
            const totalDrinks = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            const stampsToAdd = paymentMethod === 'qahwa-card' ? Math.max(0, totalDrinks - usedFreeDrinks) : totalDrinks;

            if (stampsToAdd > 0) {
              const newStamps = loyaltyCard.stamps + stampsToAdd;
              const freeCupsToEarn = Math.floor(newStamps / 6);
              const remainingStamps = newStamps % 6;

              await storage.updateLoyaltyCard(loyaltyCard.id, {
                stamps: remainingStamps,
                freeCupsEarned: loyaltyCard.freeCupsEarned + freeCupsToEarn,
                totalSpent: parseFloat(loyaltyCard.totalSpent.toString()) + parseFloat(totalAmount.toString()),
                lastUsedAt: new Date()
              });

              // Create loyalty transaction for stamps
              await storage.createLoyaltyTransaction({
                cardId: loyaltyCard.id,
                type: 'stamps_earned',
                pointsChange: stampsToAdd,
                discountAmount: 0,
                orderAmount: totalAmount,
                description: `اكتسبت ${stampsToAdd} ختم من الطلب`,
              });

              // Create transaction for free cups earned
              if (freeCupsToEarn > 0) {
                await storage.createLoyaltyTransaction({
                  cardId: loyaltyCard.id,
                  type: 'free_cup_earned',
                  pointsChange: 0,
                  discountAmount: 0,
                  orderAmount: totalAmount,
                  description: `اكتسبت ${freeCupsToEarn} قهوة مجانية!`,
                });
              }
            }
          }
        } catch (error) {
          console.error("Error adding stamps:", error);
          // Don't fail the order if stamp addition fails
        }
      }

      // Parse items from JSON string and serialize the order
      const serializedOrder = serializeDoc(order);
      if (serializedOrder.items && typeof serializedOrder.items === 'string') {
        try {
          serializedOrder.items = JSON.parse(serializedOrder.items);
        } catch (e) {
          console.error("Error parsing order items:", e);
        }
      }
      
      res.status(201).json(serializedOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items
      const orderItems = await storage.getOrderItems(id);

      res.json({
        ...order,
        orderItems
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Get order by number - for public tracking
  app.get("/api/orders/number/:orderNumber", async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);

      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      // Serialize and parse items
      const serializedOrder = serializeDoc(order);
      if (serializedOrder.items && typeof serializedOrder.items === 'string') {
        try {
          serializedOrder.items = JSON.parse(serializedOrder.items);
        } catch (e) {
          console.error("Error parsing order items:", e);
          serializedOrder.items = [];
        }
      }

      res.json(serializedOrder);
    } catch (error) {
      console.error("Error fetching order by number:", error);
      res.status(500).json({ error: "فشل في جلب معلومات الطلب" });
    }
  });

  // Update order car pickup info
  app.post("/api/orders/:id/car-pickup", async (req, res) => {
    try {
      const { id } = req.params;
      const { carType, carColor } = req.body;

      if (!carType || !carColor) {
        return res.status(400).json({ error: "Car type and color are required" });
      }

      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const carPickup = { carType, carColor };
      const updatedOrder = await storage.updateOrderCarPickup(id, carPickup);

      if (!updatedOrder) {
        return res.status(404).json({ error: "Failed to update order" });
      }

      res.json(serializeDoc(updatedOrder));
    } catch (error) {
      console.error("Error updating car pickup info:", error);
      res.status(500).json({ error: "Failed to update car pickup info" });
    }
  });

  // Update order status (branch-restricted for managers)
  app.put("/api/orders/:id/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, cancellationReason } = req.body;

      // Valid statuses for order workflow
      const validStatuses = ['pending', 'payment_confirmed', 'in_progress', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Verify branch access for non-admin users
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (req.employee?.role !== "admin" && order.branchId !== req.employee?.branchId) {
        return res.status(403).json({ error: "Access denied - different branch" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status, cancellationReason);

      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Send WhatsApp notification to customer
      try {
        const customerInfo = typeof updatedOrder.customerInfo === 'string'
          ? JSON.parse(updatedOrder.customerInfo)
          : updatedOrder.customerInfo;

        const phoneNumber = customerInfo?.phoneNumber;

        if (phoneNumber && status !== 'pending') {
          const message = getOrderStatusMessage(status, updatedOrder.orderNumber);
          // The WhatsApp URL generation logic should remain the same
          const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

          // Return WhatsApp URL in response so frontend can optionally use it
          return res.json({
            ...updatedOrder,
            whatsappNotification: {
              url: whatsappUrl,
              message: message,
              phone: phoneNumber
            }
          });
        }
      } catch (notificationError) {
        console.error("WhatsApp notification error:", notificationError);
        // Continue even if notification fails
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Get all orders (branch-filtered for managers)
  app.get("/api/orders", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const { limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const offsetNum = offset ? parseInt(offset as string) : undefined;

      const allOrders = await storage.getOrders(limitNum, offsetNum);

      // Filter by branch for non-admin managers
      const orders = filterByBranch(allOrders, req.employee);

      const coffeeItems = await storage.getCoffeeItems();

      // Enrich orders with coffee item details
      const enrichedOrders = orders.map(order => {
        const serializedOrder = serializeDoc(order);
        
        // Parse items if they're stored as JSON string
        let orderItems = serializedOrder.items;
        if (typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch (e) {
            console.error("Error parsing order items:", e);
            orderItems = [];
          }
        }
        
        // Ensure orderItems is an array
        if (!Array.isArray(orderItems)) {
          orderItems = [];
        }
        
        const items = orderItems.map((item: any) => {
          const coffeeItem = coffeeItems.find(ci => ci.id === item.coffeeItemId);
          return {
            ...item,
            coffeeItem: coffeeItem ? {
              nameAr: coffeeItem.nameAr,
              nameEn: coffeeItem.nameEn,
              price: coffeeItem.price,
              imageUrl: coffeeItem.imageUrl
            } : null
          };
        });

        return {
          ...serializedOrder,
          items
        };
      });

      return res.json(enrichedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get table orders (branch-filtered for managers)
  app.get("/api/orders/table", requireAuth, requireManager, async (req: AuthRequest, res) => {
    try {
      const { status } = req.query;
      const allOrders = await storage.getTableOrders(status as string | undefined);

      // Filter by branch for non-admin managers
      const orders = filterByBranch(allOrders, req.employee);

      const coffeeItems = await storage.getCoffeeItems();

      // Enrich orders with coffee item details
      const enrichedOrders = orders.map(order => {
        const serializedOrder = serializeDoc(order);
        
        let orderItems = serializedOrder.items;
        if (typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch (e) {
            orderItems = [];
          }
        }
        
        if (!Array.isArray(orderItems)) {
          orderItems = [];
        }
        
        const items = orderItems.map((item: any) => {
          const coffeeItem = coffeeItems.find(ci => ci.id === item.coffeeItemId);
          return {
            ...item,
            coffeeItem: coffeeItem ? {
              nameAr: coffeeItem.nameAr,
              nameEn: coffeeItem.nameEn,
              price: coffeeItem.price,
              imageUrl: coffeeItem.imageUrl
            } : null
          };
        });

        return {
          ...serializedOrder,
          items
        };
      });

      res.json(enrichedOrders);
    } catch (error) {
      console.error("Error fetching table orders:", error);
      res.status(500).json({ error: "Failed to fetch table orders" });
    }
  });

  // Get pending table orders (for cashier)
  // TODO: Add employee authentication middleware before production
  app.get("/api/orders/table/pending", async (req, res) => {
    try {
      const orders = await storage.getPendingTableOrders();
      const coffeeItems = await storage.getCoffeeItems();

      // Enrich orders with coffee item details
      const enrichedOrders = orders.map(order => {
        const serializedOrder = serializeDoc(order);
        
        let orderItems = serializedOrder.items;
        if (typeof orderItems === 'string') {
          try {
            orderItems = JSON.parse(orderItems);
          } catch (e) {
            orderItems = [];
          }
        }
        
        if (!Array.isArray(orderItems)) {
          orderItems = [];
        }
        
        const items = orderItems.map((item: any) => {
          const coffeeItem = coffeeItems.find(ci => ci.id === item.coffeeItemId);
          return {
            ...item,
            coffeeItem: coffeeItem ? {
              nameAr: coffeeItem.nameAr,
              nameEn: coffeeItem.nameEn,
              price: coffeeItem.price,
              imageUrl: coffeeItem.imageUrl
            } : null
          };
        });

        return {
          ...serializedOrder,
          items
        };
      });

      res.json(enrichedOrders);
    } catch (error) {
      console.error("Error fetching pending table orders:", error);
      res.status(500).json({ error: "Failed to fetch pending table orders" });
    }
  });

  // Get payment method details
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const hasFreeDrinks = req.query.hasFreeDrinks as string; // Check for hasFreeDrinks query parameter

      const paymentMethods = [
        { id: 'cash', nameAr: 'الدفع نقداً', nameEn: 'Cash Payment', details: 'ادفع عند الاستلام', icon: 'fas fa-money-bill-wave', requiresReceipt: false },
        { id: 'alinma', nameAr: 'Alinma Pay', nameEn: 'Alinma Pay', details: '0532441566', icon: 'fas fa-credit-card', requiresReceipt: true },
        { id: 'ur', nameAr: 'Ur Pay', nameEn: 'Ur Pay', details: '0532441566', icon: 'fas fa-university', requiresReceipt: true },
        { id: 'barq', nameAr: 'Barq', nameEn: 'Barq', details: '0532441566', icon: 'fas fa-bolt', requiresReceipt: true },
        { id: 'rajhi', nameAr: 'بنك الراجحي', nameEn: 'Al Rajhi Bank', details: 'SA78 8000 0539 6080 1942 4738', icon: 'fas fa-building-columns', requiresReceipt: true },
      ];

      // Add qahwa-card at the beginning if customer has free drinks
      if (hasFreeDrinks === 'true') {
        paymentMethods.unshift({
          id: 'qahwa-card',
          nameAr: 'بطاقة كوبي (مجاني)',
          nameEn: 'Qahwa Card (Free)',
          details: 'استخدم مشروبك المجاني 🎁',
          icon: 'fas fa-gift',
          requiresReceipt: false
        });
      }

      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // LOYALTY CARD ROUTES

  // Create new loyalty card (issue card to customer)
  app.post("/api/loyalty/cards", async (req, res) => {
    try {
      const { customerName, phoneNumber } = req.body;

      if (!customerName || !phoneNumber) {
        return res.status(400).json({ error: "اسم العميل ورقم الهاتف مطلوبان" });
      }

      // Check if customer already has a card
      const existingCard = await storage.getLoyaltyCardByPhone(phoneNumber);
      if (existingCard) {
        return res.status(400).json({ error: "هذا العميل لديه بطاقة ولاء مسبقاً" });
      }

      const card = await storage.createLoyaltyCard({ customerName, phoneNumber });
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating loyalty card:", error);
      res.status(500).json({ error: "فشل في إنشاء بطاقة الولاء" });
    }
  });

  // Get all loyalty cards
  app.get("/api/loyalty/cards", async (req, res) => {
    try {
      const cards = await storage.getLoyaltyCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching loyalty cards:", error);
      res.status(500).json({ error: "فشل في جلب بطاقات الولاء" });
    }
  });

  // Get loyalty card by QR token (for scanning)
  app.get("/api/loyalty/cards/qr/:qrToken", async (req, res) => {
    try {
      const { qrToken } = req.params;
      const card = await storage.getLoyaltyCardByQRToken(qrToken);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة أو غير نشطة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by QR:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Get loyalty card by phone
  app.get("/api/loyalty/cards/phone/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const card = await storage.getLoyaltyCardByPhone(phoneNumber);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by phone:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Scan loyalty card and apply discount
  app.post("/api/loyalty/scan", async (req, res) => {
    try {
      const { qrToken, orderAmount, employeeId } = req.body;

      if (!qrToken || !orderAmount) {
        return res.status(400).json({ error: "رمز QR ومبلغ الطلب مطلوبان" });
      }

      const card = await storage.getLoyaltyCardByQRToken(qrToken);

      if (!card) {
        return res.status(404).json({ error: "بطاقة ولاء غير صالحة" });
      }

      // Calculate 10% discount
      const discountPercentage = 10;
      const discountAmount = (parseFloat(orderAmount) * discountPercentage) / 100;
      const finalAmount = parseFloat(orderAmount) - discountAmount;

      // Update card - increment discount count and update last used
      await storage.updateLoyaltyCard(card.id, {
        discountCount: card.discountCount + 1,
        totalSpent: parseFloat(card.totalSpent.toString()) + finalAmount,
        lastUsedAt: new Date()
      });

      // Create loyalty transaction
      await storage.createLoyaltyTransaction({
        cardId: card.id,
        type: 'discount_applied',
        pointsChange: 0,
        discountAmount: discountAmount,
        orderAmount: parseFloat(orderAmount.toString()),
        description: `خصم ${discountPercentage}% على الطلب`,
        employeeId: employeeId || undefined
      });

      res.json({
        success: true,
        card: {
          ...card,
          discountCount: card.discountCount + 1
        },
        discount: {
          percentage: discountPercentage,
          amount: discountAmount.toFixed(2),
          originalAmount: orderAmount,
          finalAmount: finalAmount.toFixed(2)
        }
      });
    } catch (error) {
      console.error("Error scanning loyalty card:", error);
      res.status(500).json({ error: "فشل في مسح بطاقة الولاء" });
    }
  });

  // Get loyalty card transactions
  app.get("/api/loyalty/cards/:cardId/transactions", async (req, res) => {
    try {
      const { cardId } = req.params;
      const transactions = await storage.getLoyaltyTransactions(cardId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      res.status(500).json({ error: "فشل في جلب معاملات الولاء" });
    }
  });

  // Get loyalty tier information
  app.get("/api/loyalty/tiers", async (req, res) => {
    try {
      const tiers = [
        {
          id: 'bronze',
          nameAr: 'برونزي',
          nameEn: 'Bronze',
          pointsRequired: 0,
          benefits: ['خصم 10% على كل طلب', 'بطاقة رقمية مجانية'],
          color: '#CD7F32',
          icon: '🥉'
        },
        {
          id: 'silver',
          nameAr: 'فضي',
          nameEn: 'Silver',
          pointsRequired: 100,
          benefits: ['خصم 15% على كل طلب', 'قهوة مجانية شهرياً', 'أولوية في الطلبات'],
          color: '#C0C0C0',
          icon: '🥈'
        },
        {
          id: 'gold',
          nameAr: 'ذهبي',
          nameEn: 'Gold',
          pointsRequired: 500,
          benefits: ['خصم 20% على كل طلب', 'قهوتين مجانيتين شهرياً', 'دعوات خاصة للفعاليات'],
          color: '#FFD700',
          icon: '🥇'
        },
        {
          id: 'platinum',
          nameAr: 'بلاتيني',
          nameEn: 'Platinum',
          pointsRequired: 1000,
          benefits: ['خصم 25% على كل طلب', 'قهوة يومية مجانية', 'خدمة VIP', 'بطاقة فيزيائية مطبوعة'],
          color: '#E5E4E2',
          icon: '💎'
        }
      ];

      res.json(tiers);
    } catch (error) {
      console.error("Error fetching loyalty tiers:", error);
      res.status(500).json({ error: "فشل في جلب مستويات الولاء" });
    }
  });

  // Get loyalty card by card number (for cashier lookup)
  app.get("/api/loyalty/card/:cardNumber", async (req, res) => {
    try {
      const { cardNumber } = req.params;
      const card = await storage.getLoyaltyCardByCardNumber(cardNumber);

      if (!card) {
        return res.status(404).json({ error: "بطاقة الولاء غير موجودة" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card by number:", error);
      res.status(500).json({ error: "فشل في جلب بطاقة الولاء" });
    }
  });

  // Generate loyalty codes for an order
  app.post("/api/orders/:orderId/generate-codes", async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      const orderItems = Array.isArray(order.items) ? order.items : [];
      const drinks = orderItems.map((item: any) => ({
        name: item.nameAr || item.name || "مشروب",
        quantity: item.quantity || 1
      }));

      const codes = await storage.generateCodesForOrder(orderId, drinks);
      res.status(201).json(codes);
    } catch (error) {
      console.error("Error generating codes:", error);
      res.status(500).json({ error: "فشل في إنشاء الأكواد" });
    }
  });

  // Get codes for an order
  app.get("/api/orders/:orderId/codes", async (req, res) => {
    try {
      const { orderId } = req.params;
      const codes = await storage.getCodesByOrder(orderId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching codes:", error);
      res.status(500).json({ error: "فشل في جلب الأكواد" });
    }
  });

  // Redeem a code on a loyalty card
  app.post("/api/loyalty/redeem-code", async (req, res) => {
    try {
      const { code, cardId } = req.body;

      if (!code || !cardId) {
        return res.status(400).json({ error: "الكود ومعرف البطاقة مطلوبان" });
      }

      const result = await storage.redeemCode(code, cardId);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({
        success: true,
        message: result.message,
        card: result.card
      });
    } catch (error) {
      console.error("Error redeeming code:", error);
      res.status(500).json({ error: "فشل في استخدام الكود" });
    }
  });

  // INGREDIENTS ROUTES

  // Get all ingredients
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      const serialized = ingredients.map(serializeDoc);
      res.json(serialized);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  // Create ingredient
  app.post("/api/ingredients", async (req, res) => {
    try {
      const { insertIngredientSchema } = await import("@shared/schema");
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      console.error("Error creating ingredient:", error);
      res.status(500).json({ error: "Failed to create ingredient" });
    }
  });

  // Update ingredient availability
  app.patch("/api/ingredients/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      
      // Update ingredient availability
      const ingredient = await storage.updateIngredientAvailability(id, isAvailable);
      
      // Guard: Check if ingredient exists
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      
      // Get all coffee items that use this ingredient
      const affectedCoffeeItems = await storage.getCoffeeItemsByIngredient(id);
      
      // Update availability of affected coffee items
      for (const coffeeItem of affectedCoffeeItems) {
        if (isAvailable === 0) {
          // If ingredient is unavailable, mark all items using it as unavailable
          await storage.updateCoffeeItem(coffeeItem.id, {
            isAvailable: 0,
            availabilityStatus: `نفذ ${ingredient.nameAr}`
          });
        } else {
          // If ingredient is now available, check if all other ingredients are available
          const itemIngredients = await storage.getCoffeeItemIngredients(coffeeItem.id);
          const allIngredientsAvailable = itemIngredients.every(ing => ing.isAvailable === 1);
          
          if (allIngredientsAvailable) {
            // All ingredients available, make the item available
            await storage.updateCoffeeItem(coffeeItem.id, {
              isAvailable: 1,
              availabilityStatus: "متوفر"
            });
          }
        }
      }
      
      res.json({ 
        ingredient, 
        affectedItems: affectedCoffeeItems.length 
      });
    } catch (error) {
      console.error("Error updating ingredient:", error);
      res.status(500).json({ error: "Failed to update ingredient" });
    }
  });

  // Get ingredients for a coffee item
  app.get("/api/coffee-items/:id/ingredients", async (req, res) => {
    try {
      const { id } = req.params;
      const ingredients = await storage.getCoffeeItemIngredients(id);
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching coffee item ingredients:", error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  // Add ingredient to coffee item
  app.post("/api/coffee-items/:id/ingredients", async (req, res) => {
    try {
      const { id } = req.params;
      const { ingredientId } = req.body;
      const result = await storage.addCoffeeItemIngredient(id, ingredientId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding ingredient to coffee item:", error);
      res.status(500).json({ error: "Failed to add ingredient" });
    }
  });

  // Remove ingredient from coffee item
  app.delete("/api/coffee-items/:id/ingredients/:ingredientId", async (req, res) => {
    try {
      const { id, ingredientId } = req.params;
      await storage.removeCoffeeItemIngredient(id, ingredientId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing ingredient:", error);
      res.status(500).json({ error: "Failed to remove ingredient" });
    }
  });

  // Get coffee items affected by ingredient
  app.get("/api/ingredients/:id/coffee-items", async (req, res) => {
    try {
      const { id } = req.params;
      const coffeeItems = await storage.getCoffeeItemsByIngredient(id);
      res.json(coffeeItems);
    } catch (error) {
      console.error("Error fetching coffee items by ingredient:", error);
      res.status(500).json({ error: "Failed to fetch coffee items" });
    }
  });

  // BRANCH MANAGEMENT ROUTES
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });

  app.get("/api/branches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const branch = await storage.getBranch(id);
      if (!branch) {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ error: "Failed to fetch branch" });
    }
  });

  app.post("/api/branches", async (req, res) => {
    try {
      const { insertBranchSchema } = await import("@shared/schema");
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create branch" });
    }
  });

  app.put("/api/branches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const branch = await storage.updateBranch(id, req.body);
      if (!branch) {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      console.error("Error updating branch:", error);
      res.status(500).json({ error: "Failed to update branch" });
    }
  });

  app.delete("/api/branches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBranch(id);
      if (!deleted) {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ error: "Failed to delete branch" });
    }
  });

  // CATEGORY MANAGEMENT ROUTES
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { insertCategorySchema } = await import("@shared/schema");
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // CUSTOMER MANAGEMENT ROUTES (for manager dashboard)
  app.get("/api/admin/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      const customersWithoutPasswords = customers.map(({ password: _, ...customer }) => customer);
      res.json(customersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Get orders by employee (for manager to see each cashier's orders)
  app.get("/api/admin/orders/employee/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const orders = await storage.getOrdersByEmployee(employeeId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching employee orders:", error);
      res.status(500).json({ error: "Failed to fetch employee orders" });
    }
  });

  // TEMPORARY: Reset manager password
  app.post("/api/reset-manager", async (req, res) => {
    try {
      const manager = await storage.getEmployeeByUsername("manager");
      if (manager && manager._id) {
        const hashedPassword = await bcrypt.hash("2030", 10);
        await storage.updateEmployee(manager._id.toString(), { password: hashedPassword });
        console.log("✅ Manager password reset successfully");
        res.json({ message: "Manager password reset successfully" });
      } else {
        res.status(404).json({ error: "Manager not found" });
      }
    } catch (error) {
      console.error("Error resetting manager password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/delivery-zones", async (req, res) => {
    try {
      const zones = await storage.getDeliveryZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching delivery zones:", error);
      res.status(500).json({ error: "Failed to fetch delivery zones" });
    }
  });

  app.get("/api/delivery-zones/:id", async (req, res) => {
    try {
      const zone = await storage.getDeliveryZone(req.params.id);
      if (!zone) {
        return res.status(404).json({ error: "Delivery zone not found" });
      }
      res.json(zone);
    } catch (error) {
      console.error("Error fetching delivery zone:", error);
      res.status(500).json({ error: "Failed to fetch delivery zone" });
    }
  });

  app.post("/api/delivery-zones/validate", async (req, res) => {
    try {
      const { lat, lng } = req.body;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }

      const zones = await storage.getDeliveryZones();
      const { getDeliveryZoneForPoint } = await import("./utils/geo");
      
      const mappedZones = zones.map(z => ({
        coordinates: z.coordinates,
        nameAr: z.nameAr,
        deliveryFee: z.deliveryFee,
        _id: z._id?.toString() || z.id || ''
      }));
      
      const result = getDeliveryZoneForPoint({ lat, lng }, mappedZones);
      
      if (!result) {
        return res.json({ 
          isInZone: false, 
          message: "عذراً، هذا الموقع خارج نطاق التوصيل. نوصل فقط إلى البديعة وظهرة البديعة" 
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error validating delivery zone:", error);
      res.status(500).json({ error: "Failed to validate delivery zone" });
    }
  });

  // TABLE MANAGEMENT ROUTES - إدارة الطاولات
  
  app.get("/api/tables", async (req, res) => {
    try {
      const { branchId } = req.query;
      const tables = await storage.getTables(branchId as string);
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Error fetching table:", error);
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.get("/api/tables/qr/:qrToken", async (req, res) => {
    try {
      const table = await storage.getTableByQRToken(req.params.qrToken);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Error fetching table by QR token:", error);
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const { insertTableSchema } = await import("@shared/schema");
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error: any) {
      console.error("Error creating table:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create table" });
    }
  });

  app.post("/api/tables/bulk-create", async (req, res) => {
    try {
      const { count, branchId } = req.body;
      
      if (!count || count < 1 || count > 100) {
        return res.status(400).json({ error: "Count must be between 1 and 100" });
      }

      if (!branchId || typeof branchId !== 'string') {
        return res.status(400).json({ error: "Valid branchId is required" });
      }

      const results = {
        created: [] as any[],
        failed: [] as { tableNumber: string, reason: string }[],
        totalRequested: count,
      };

      for (let i = 1; i <= count; i++) {
        const tableNumber = String(i).padStart(2, '0');
        try {
          const table = await storage.createTable({
            tableNumber,
            branchId
          });
          results.created.push(table);
        } catch (tableError: any) {
          // Track failures with reason
          results.failed.push({
            tableNumber,
            reason: tableError.message || "Unknown error"
          });
        }
      }

      // Return appropriate status code based on results
      if (results.created.length === 0) {
        // All failed
        return res.status(409).json({
          error: "Failed to create any tables",
          details: results
        });
      } else if (results.failed.length > 0) {
        // Partial success - use 207 Multi-Status
        return res.status(207).json({
          message: `Created ${results.created.length} of ${count} tables`,
          details: results
        });
      } else {
        // Complete success
        return res.status(201).json({
          message: `Successfully created ${results.created.length} tables`,
          details: results
        });
      }
    } catch (error) {
      console.error("Error bulk creating tables:", error);
      res.status(500).json({ error: "Failed to create tables" });
    }
  });

  app.put("/api/tables/:id", async (req, res) => {
    try {
      // Validate update data (partial schema validation)
      const { insertTableSchema } = await import("@shared/schema");
      const partialSchema = insertTableSchema.partial(); // Allow partial updates
      const validatedData = partialSchema.parse(req.body);
      
      const table = await storage.updateTable(req.params.id, validatedData);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error: any) {
      console.error("Error updating table:", error);
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: "Failed to update table" });
    }
  });

  app.patch("/api/tables/:id/occupancy", async (req, res) => {
    try {
      const { isOccupied, currentOrderId } = req.body;
      const table = await storage.updateTableOccupancy(
        req.params.id, 
        isOccupied ? 1 : 0, 
        currentOrderId
      );
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Error updating table occupancy:", error);
      res.status(500).json({ error: "Failed to update table occupancy" });
    }
  });

  app.delete("/api/tables/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTable(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ error: "Failed to delete table" });
    }
  });

  app.get("/api/tables/:id/qr-code", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const tableUrl = `${baseUrl}/table-menu/${table.qrToken}`;
      
      // Get branch info for QR card
      const branch = await storage.getBranch(table.branchId);

      res.json({
        tableUrl,
        tableNumber: table.tableNumber,
        qrToken: table.qrToken,
        branchName: branch?.nameAr || 'قهوة كوب'
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // Reserve a table
  app.post("/api/tables/:id/reserve", async (req, res) => {
    try {
      const { customerName, customerPhone, employeeId } = req.body;
      
      if (!customerName || !customerPhone || !employeeId) {
        return res.status(400).json({ error: "Customer name, phone, and employee ID required" });
      }

      // Get employee to verify branch
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Get table to verify it belongs to the same branch
      const existingTable = await storage.getTable(req.params.id);
      if (!existingTable) {
        return res.status(404).json({ error: "Table not found" });
      }

      // Verify branch ownership
      if (existingTable.branchId && employee.branchId && existingTable.branchId !== employee.branchId) {
        return res.status(403).json({ error: "Cannot reserve tables in other branches" });
      }

      const table = await storage.updateTable(req.params.id, {
        isOccupied: 1,
        reservedFor: {
          customerName,
          customerPhone,
          reservedAt: new Date(),
          reservedBy: employeeId
        }
      });

      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }

      res.json(table);
    } catch (error) {
      console.error("Error reserving table:", error);
      res.status(500).json({ error: "Failed to reserve table" });
    }
  });

  // Release a table reservation
  app.post("/api/tables/:id/release", async (req, res) => {
    try {
      const { employeeId } = req.body;

      // Optionally verify branch ownership if employeeId is provided
      if (employeeId) {
        const employee = await storage.getEmployee(employeeId);
        if (!employee) {
          return res.status(404).json({ error: "Employee not found" });
        }

        const existingTable = await storage.getTable(req.params.id);
        if (!existingTable) {
          return res.status(404).json({ error: "Table not found" });
        }

        // Verify branch ownership
        if (existingTable.branchId && employee.branchId && existingTable.branchId !== employee.branchId) {
          return res.status(403).json({ error: "Cannot release tables in other branches" });
        }
      }

      const table = await storage.updateTable(req.params.id, {
        isOccupied: 0,
        reservedFor: undefined,
        currentOrderId: undefined
      });

      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }

      res.json(table);
    } catch (error) {
      console.error("Error releasing table:", error);
      res.status(500).json({ error: "Failed to release table" });
    }
  });

  // Customer table reservation
  app.post("/api/tables/customer-reserve", async (req, res) => {
    try {
      const { tableId, customerName, customerPhone, customerId, reservationDate, reservationTime, numberOfGuests, branchId } = req.body;
      
      if (!tableId || !customerName || !customerPhone || !reservationDate || !reservationTime || !numberOfGuests) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const table = await storage.getTable(tableId);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }

      if (table.isOccupied) {
        return res.status(400).json({ error: "Table is currently occupied" });
      }

      // Check for existing active reservations
      if (table.reservedFor && (table.reservedFor.status === 'pending' || table.reservedFor.status === 'confirmed')) {
        return res.status(400).json({ error: "Table already has an active reservation" });
      }

      const updatedTable = await storage.updateTable(tableId, {
        reservedFor: {
          customerName,
          customerPhone,
          customerId,
          reservationDate: new Date(reservationDate),
          reservationTime,
          numberOfGuests,
          reservedAt: new Date(),
          reservedBy: customerId || 'customer',
          status: 'pending'
        }
      });

      if (!updatedTable) {
        return res.status(500).json({ error: "Failed to reserve table" });
      }

      res.json({ success: true, table: updatedTable });
    } catch (error) {
      console.error("Error creating customer reservation:", error);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  // Get available tables for reservation
  app.get("/api/tables/available", async (req, res) => {
    try {
      const { branchId, date } = req.query;
      
      if (!branchId) {
        return res.status(400).json({ error: "Branch ID required" });
      }

      const tables = await storage.getTables(branchId as string);
      const availableTables = tables.filter(t => 
        t.isActive === 1 && 
        (!t.reservedFor || t.reservedFor.status === 'cancelled' || t.reservedFor.status === 'completed')
      );

      res.json(availableTables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      res.status(500).json({ error: "Failed to fetch available tables" });
    }
  });

  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAvailableDrivers();
      const driversWithoutPasswords = drivers.map(({ password: _, ...driver }) => driver);
      res.json(driversWithoutPasswords);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.patch("/api/drivers/:id/availability", async (req, res) => {
    try {
      const { isAvailable } = req.body;
      const driver = await storage.updateDriverAvailability(req.params.id, isAvailable);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      const { password: _, ...driverData } = driver;
      res.json(driverData);
    } catch (error) {
      console.error("Error updating driver availability:", error);
      res.status(500).json({ error: "Failed to update driver availability" });
    }
  });

  app.patch("/api/drivers/:id/location", async (req, res) => {
    try {
      const { lat, lng } = req.body;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      const driver = await storage.updateDriverLocation(req.params.id, { lat, lng });
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      const { password: _, ...driverData } = driver;
      res.json(driverData);
    } catch (error) {
      console.error("Error updating driver location:", error);
      res.status(500).json({ error: "Failed to update driver location" });
    }
  });

  app.patch("/api/orders/:id/assign-driver", async (req, res) => {
    try {
      const { driverId } = req.body;
      if (!driverId) {
        return res.status(400).json({ error: "Driver ID required" });
      }

      const order = await storage.assignDriverToOrder(req.params.id, driverId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error assigning driver:", error);
      res.status(500).json({ error: "Failed to assign driver" });
    }
  });

  app.patch("/api/orders/:id/start-delivery", async (req, res) => {
    try {
      const order = await storage.startDelivery(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error starting delivery:", error);
      res.status(500).json({ error: "Failed to start delivery" });
    }
  });

  app.patch("/api/orders/:id/complete-delivery", async (req, res) => {
    try {
      const order = await storage.completeDelivery(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error completing delivery:", error);
      res.status(500).json({ error: "Failed to complete delivery" });
    }
  });

  app.get("/api/delivery/active-orders", async (req, res) => {
    try {
      const orders = await storage.getActiveDeliveryOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching active delivery orders:", error);
      res.status(500).json({ error: "Failed to fetch active delivery orders" });
    }
  });

  app.get("/api/drivers/:id/orders", async (req, res) => {
    try {
      const orders = await storage.getDriverActiveOrders(req.params.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching driver orders:", error);
      res.status(500).json({ error: "Failed to fetch driver orders" });
    }
  });

  // CASHIER - CUSTOMER MANAGEMENT ROUTES

  // Search for customer by phone number (for cashier)
  app.get("/api/cashier/customers/search", async (req, res) => {
    try {
      const { phone } = req.query;
      
      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: "رقم الهاتف مطلوب" });
      }

      const cleanPhone = phone.trim().replace(/\s/g, '');
      const customer = await storage.getCustomerByPhone(cleanPhone);
      
      if (customer) {
        // Customer exists - return their info
        res.json({
          exists: true,
          customer: {
            id: customer._id,
            phone: customer.phone,
            name: customer.name,
            email: customer.email,
            points: customer.points || 0,
            registeredBy: customer.registeredBy,
            isPasswordSet: customer.isPasswordSet || 0
          }
        });
      } else {
        // Customer doesn't exist
        res.json({
          exists: false,
          phone: cleanPhone
        });
      }
    } catch (error) {
      console.error("Error searching for customer:", error);
      res.status(500).json({ error: "فشل البحث عن العميل" });
    }
  });

  // Register customer by cashier (partial registration)
  app.post("/api/cashier/customers/register", async (req, res) => {
    try {
      const { phone, name } = req.body;

      if (!phone || !name) {
        return res.status(400).json({ error: "رقم الهاتف والاسم مطلوبان" });
      }

      // Validate phone format
      const cleanPhone = phone.trim().replace(/\s/g, '');
      if (cleanPhone.length !== 9 || !cleanPhone.startsWith('5')) {
        return res.status(400).json({ error: "رقم الهاتف يجب أن يكون 9 أرقام ويبدأ بـ 5" });
      }

      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByPhone(cleanPhone);
      if (existingCustomer) {
        return res.status(400).json({ error: "العميل مسجل بالفعل" });
      }

      // Create customer with cashier registration
      const customer = await storage.createCustomer({
        phone: cleanPhone,
        name: name.trim(),
        registeredBy: 'cashier',
        isPasswordSet: 0,
        points: 0
      });

      res.status(201).json({
        id: customer._id,
        phone: customer.phone,
        name: customer.name,
        points: customer.points,
        registeredBy: customer.registeredBy,
        isPasswordSet: customer.isPasswordSet
      });
    } catch (error) {
      console.error("Error registering customer by cashier:", error);
      res.status(500).json({ error: "فشل تسجيل العميل" });
    }
  });

  // TABLE ORDER MANAGEMENT ROUTES

  // Cancel order by customer (only before payment confirmation)
  app.patch("/api/orders/:id/cancel-by-customer", async (req, res) => {
    try {
      const { cancellationReason } = req.body;
      const { OrderModel } = await import("@shared/schema");
      
      const order = await OrderModel.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      // Only allow cancellation if order is pending
      if (order.tableStatus && order.tableStatus !== 'pending') {
        return res.status(400).json({ error: "لا يمكن إلغاء الطلب بعد تأكيد الدفع" });
      }

      order.status = 'cancelled';
      order.tableStatus = 'cancelled';
      order.cancelledBy = 'customer';
      order.cancellationReason = cancellationReason || 'إلغاء من العميل';
      order.updatedAt = new Date();
      
      await order.save();
      
      // Update table occupancy if applicable
      if (order.tableId) {
        await storage.updateTableOccupancy(order.tableId, 0);
      }

      res.json(order);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "فشل إلغاء الطلب" });
    }
  });

  // Assign order to cashier (or accept pending order)
  app.patch("/api/orders/:id/assign-cashier", async (req, res) => {
    try {
      const { cashierId } = req.body;
      const { OrderModel } = await import("@shared/schema");
      
      if (!cashierId) {
        return res.status(400).json({ error: "معرف الكاشير مطلوب" });
      }

      const order = await OrderModel.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      if (order.assignedCashierId) {
        return res.status(400).json({ error: "الطلب مستلم بالفعل من كاشير آخر" });
      }

      order.assignedCashierId = cashierId;
      order.updatedAt = new Date();
      
      await order.save();

      res.json(order);
    } catch (error) {
      console.error("Error assigning cashier:", error);
      res.status(500).json({ error: "فشل استلام الطلب" });
    }
  });

  // Update table order status (by cashier)
  app.patch("/api/orders/:id/table-status", async (req, res) => {
    try {
      const { tableStatus } = req.body;
      const { OrderModel } = await import("@shared/schema");
      
      const validStatuses = ['pending', 'payment_confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (!tableStatus || !validStatuses.includes(tableStatus)) {
        return res.status(400).json({ error: "حالة الطلب غير صالحة" });
      }

      const order = await OrderModel.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      order.tableStatus = tableStatus;
      order.updatedAt = new Date();

      // Update main status based on table status
      if (tableStatus === 'payment_confirmed') {
        order.status = 'payment_confirmed';
      } else if (tableStatus === 'delivered') {
        order.status = 'completed';
        // Mark table as available
        if (order.tableId) {
          await storage.updateTableOccupancy(order.tableId, 0);
        }
      } else if (tableStatus === 'cancelled') {
        order.status = 'cancelled';
        order.cancelledBy = 'cashier';
        if (order.tableId) {
          await storage.updateTableOccupancy(order.tableId, 0);
        }
      }
      
      await order.save();

      res.json(order);
    } catch (error) {
      console.error("Error updating table status:", error);
      res.status(500).json({ error: "فشل تحديث حالة الطلب" });
    }
  });

  // Get orders assigned to specific cashier
  app.get("/api/cashier/:cashierId/orders", async (req, res) => {
    try {
      const { OrderModel } = await import("@shared/schema");
      const { status } = req.query;
      
      const query: any = {
        assignedCashierId: req.params.cashierId,
        orderType: 'table'
      };

      if (status) {
        query.tableStatus = status;
      }

      const orders = await OrderModel.find(query).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching cashier orders:", error);
      res.status(500).json({ error: "Failed to fetch cashier orders" });
    }
  });

  // Get unassigned pending table orders
  app.get("/api/orders/table/unassigned", async (req, res) => {
    try {
      const { OrderModel } = await import("@shared/schema");
      
      const orders = await OrderModel.find({
        orderType: 'table',
        tableStatus: 'pending',
        assignedCashierId: { $exists: false }
      }).sort({ createdAt: 1 });

      res.json(orders);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
      res.status(500).json({ error: "Failed to fetch unassigned orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}