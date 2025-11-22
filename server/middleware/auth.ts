import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  employee?: {
    id: string;
    username: string;
    role: string;
    branchId?: string;
    fullName: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session.employee) {
    return res.status(401).json({ error: "Unauthorized - Please log in" });
  }

  req.employee = req.session.employee;
  next();
}

export function requireManager(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.employee) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.employee.role !== "manager" && req.employee.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Manager access required" });
  }

  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.employee) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.employee.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }

  next();
}

// Filter data by branch for managers (admins see all)
export function filterByBranch<T extends { branchId?: string }>(
  data: T[],
  employee?: AuthRequest["employee"]
): T[] {
  if (!employee || employee.role === "admin") {
    return data;
  }

  if (employee.branchId) {
    return data.filter(item => item.branchId === employee.branchId);
  }

  return [];
}
