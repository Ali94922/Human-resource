export type ContractType = "daily" | "permanent";
export type ContractorType = "altariq" | "yuanda";

export interface EgyptianIDData {
  fullName: string;
  nationalId: string;
  address: string;
  jobTitle: string;
  dateOfBirth: string;
  governorate: string;
  gender: "ذكر" | "أنثى" | "";
  qualification?: string;
  cardIssueDate?: string; // e.g. 2/2026 or 12/2023 from back of card
}

export interface ContractFormData {
  id?: string;
  fullName: string;
  nationalId: string;
  phoneNumber?: string;
  address: string;
  jobTitle: string;
  dateOfBirth: string;
  governorate: string;
  gender: "ذكر" | "أنثى" | "";
  qualification?: string;
  cardIssueDate?: string; // e.g. 2/2026 or 12/2023 from back of card
  
  // Contract-specific fields
  contractType: ContractType;
  employer: ContractorType | "yuanda_permanent"; // Al-Tariq, Yuanda Daily, Yuanda Permanent
  startDate: string;
  endDate?: string;
  dailyWage?: number; // for daily contract
  monthlySalary?: number; // for permanent contract
  customAmount?: string; // custom written amount for the contract
  workingHours: number;
  notes?: string;
  createdByUserId?: string; // Track who drafted this contract
}

export type UserRole = "admin" | "entry" | "reviewer";

export interface UserPermissions {
  form: boolean;
  template: boolean;
  users: boolean;
  reports: boolean;
  permits?: boolean;
}

export interface AppPermissions {
  [username: string]: UserPermissions;
}

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  department: string;
  createdContractsCount: number;
  createdAt: string;
  tempPassword?: string;
}
