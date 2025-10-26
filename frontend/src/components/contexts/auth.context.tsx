import { createContext } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

