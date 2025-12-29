import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import mongoose from "mongoose";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const SessionStore = MemoryStore(session);

const MONGODB_URI = process.env.MONGODB_URI || "";


// Track database connection status
let isDbConnected = false;

// Connect to MongoDB in the background (don't block server startup)
async function connectDatabase() {
  if (!MONGODB_URI) {
    console.error("❌ WARNING: MONGODB_URI environment variable is not set");
    console.log("Database functionality will be unavailable");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isDbConnected = true;
    console.log("✅ MongoDB connected successfully");
    
    // Run seeds in background after connection
    const { runSeeds } = await import("./seed");
    await runSeeds();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Don't exit - let the server continue running for health checks
  }
}

// Start database connection in background
connectDatabase();

// Scheduled task: Clean up expired table reservations and send notifications
let isMaintenanceRunning = false;
setInterval(async () => {
  if (isMaintenanceRunning || !isDbConnected) return;
  
  isMaintenanceRunning = true;
  try {
    const { TableModel, CustomerModel } = await import("@shared/schema");
    const { sendReservationExpiryWarningEmail } = await import("./mail-service");

    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

    // 1. Check for expired reservations
    const expiredTables = await TableModel.find({
      'reservedFor.status': { $in: ['pending', 'confirmed'] },
      'reservedFor.autoExpiryTime': { $lt: now }
    });

    let expiredCount = 0;
    for (const table of expiredTables) {
      if (table.reservedFor) {
        table.reservedFor.status = 'expired';
        await table.save();
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`🔄 Cleaned ${expiredCount} expired reservations`);
    }

    // 2. Send expiry warnings (15 minutes before expiry)
    const warningTables = await TableModel.find({
      'reservedFor.status': { $in: ['pending', 'confirmed'] },
      'reservedFor.autoExpiryTime': {
        $gte: now,
        $lte: fifteenMinutesFromNow
      },
      'reservedFor.emailNotificationSent': { $ne: true }
    });

    for (const table of warningTables) {
      if (table.reservedFor && table.reservedFor.autoExpiryTime) {
        try {
          const customer = await CustomerModel.findOne({
            phone: table.reservedFor.customerPhone
          });

          if (customer && customer.email) {
            const emailSent = await sendReservationExpiryWarningEmail(
              customer.email,
              table.reservedFor.customerName,
              table.tableNumber,
              table.reservedFor.autoExpiryTime.toString()
            );

            if (emailSent) {
              table.reservedFor.emailNotificationSent = true;
              await table.save();
              console.log(`📧 Expiry warning sent to ${customer.email}`);
            }
          }
        } catch (error) {
          console.error(`Failed to send expiry warning for table ${table.tableNumber}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Maintenance task error:", error);
  } finally {
    isMaintenanceRunning = false;
  }
}, 60000); // Run every 60 seconds (1 minute)

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Trust proxy - required for Render, Replit, and other reverse proxy services
app.set('trust proxy', 1);

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "qahwa-cup-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false, // Changed to false for better security
    store: new SessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS), false in development
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // Use lax for both environments
      path: "/",
    },
  })
);

// Debug middleware to log session state
app.use((req, res, next) => {
  if (req.path.startsWith('/api/orders') || req.path.startsWith('/api/employees/login')) {
    console.log(`  - Session ID:`, req.sessionID);
    console.log(`  - Employee:`, req.session?.employee ? 'EXISTS' : 'MISSING');
    console.log(`  - Cookie:`, req.headers.cookie ? 'PRESENT' : 'MISSING');
  }
  next();
});

// Health check endpoint for Render and other hosting services
// This must respond quickly without waiting for database
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'connecting'
  });
});

// Serve attached assets for both development and production
app.use('/attached_assets', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Verify Mail Service on startup
    try {
      const { testEmailConnection } = await import("./mail-service");
      console.log("📧 Performing startup email connection test...");
      const success = await testEmailConnection();
      if (success) {
        console.log("✅ Mail service verified and ready on startup");
      } else {
        console.error("❌ Mail service failed verification on startup. Check credentials and connectivity.");
      }
    } catch (err) {
      console.error("❌ Error during mail service startup test:", err);
    }
  });
})();
