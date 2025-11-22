import "express-session";

declare module "express-session" {
  interface SessionData {
    employee?: {
      id: string;
      username: string;
      role: string;
      branchId?: string;
      fullName: string;
    };
  }
}
