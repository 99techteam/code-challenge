import { create } from "zustand";
import CryptoJS from "crypto-js";

export interface User {
  access_token: string;
  username: string;
}

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user: User) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(user),
      process.env.NEXT_PUBLIC_SECRET_KEY || ""
    ).toString();
    localStorage.setItem("user", encrypted);
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
  loadUser: () => {
    const encrypted = localStorage.getItem("user");
    if (encrypted) {
      const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        process.env.NEXT_PUBLIC_SECRET_KEY || ""
      ).toString(CryptoJS.enc.Utf8);
      set({ user: JSON.parse(decrypted) });
    }
  },
}));
