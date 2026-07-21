"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getMe } from "@/shared/api/profile";

const MOCK_USER = {
  pk: 1,
  email: "test@test.ru",
  first_name: "Иван",
  last_name: "Иванов",
  patronymic_name: "Иванович",
  date_of_birth: "1990-01-15",
  child: {
    pk: 1,
    first_name: "Мария",
    last_name: "Иванова",
    patronymic_name: "Ивановна",
    date_of_birth: "2012-03-10",
    school: 1,
    class_number: 1,
  },
};

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
        if (process.env.NODE_ENV !== "production") {
          setUser(MOCK_USER);
          return MOCK_USER;
        }
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
