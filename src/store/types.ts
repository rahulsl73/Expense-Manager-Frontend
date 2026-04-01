export interface User {
  id: number;
  username: string;
  email: string;
  monthlyBudget: number;
}

export interface AuthResponse {
  userId: number;
  email: string;
}


export type Theme = "LIGHT" | "DARK";

export interface SettingsInput {
  currencyCode: string;
  theme: Theme;
}

export interface Settings extends SettingsInput {
  userId: number;
}


export interface Expense {
  id: number;
  title: string;
  amount: number;       
  category: string;
  date: string;        
  tags: string[];
  note: string | null;
}

export interface InitialValues extends Expense {}

export interface Summary {
  totalSpent: number;
  expenseCount: number;
  averageSpent: number;
}

export interface SummaryResponse {
  totalSpent: number;
}

export interface CategoryData {
  category: string;
  value: number;
}

export interface TopTx {
  title: string;
  amount: number;
}

export interface LineData {
  period: string;
  amount: number;
}



export interface FilterParams {
  page: number;
  size: number;
  start: string;  
  end: string;     
  category: string;
}



export type Interval = "day" | "month" | "year";
