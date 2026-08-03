"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getMe } from "@/shared/api/profile";


const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    return getMe()
      .then((data) => {
        setUser(data);
        return data;
      })
      .catch(() => {
        setUser(null);
        return null;
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <UserContext.Provider value={{ user, loading, setUser, refetch }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
