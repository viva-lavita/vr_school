"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import { ApiError } from "@/shared/api/client";
import { loginUser } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Неверный email";
const INVALID_CREDENTIALS_MESSAGE = "Неверный адрес электронной почты или пароль. Попробуйте снова.";

function validateForm(formData) {
  const fieldErrors = {};

  if (!formData.email.trim()) {
    fieldErrors.email = REQUIRED_MESSAGE;
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    fieldErrors.email = EMAIL_ERROR;
  }

  if (!formData.password) {
    fieldErrors.password = REQUIRED_MESSAGE;
  }

  return fieldErrors;
}

const initialFormData = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useUser();
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errors, setErrors] = useState([]);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInvalidCredentials(false);
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextFieldErrors = validateForm(formData);
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }
    setErrors([]);
    setInvalidCredentials(false);
    setLoading(true);
    try {
      await loginUser(formData);
      await refetch();
      router.push("/profile/information");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setErrors([INVALID_CREDENTIALS_MESSAGE]);
        setInvalidCredentials(true);
      } else {
        setErrors(["Не удалось войти. Проверьте соединение и попробуйте снова."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-30">
      <div className="w-full md:w-[565px] bg-light-green px-5 md:px-12 rounded-4xl p-15">
        <p className="text-h3 text-black uppercase pb-3 text-center">Вход</p>
        <p className="text-2 text-black text-center pb-12">
            Нет аккаунта? <Link href="/register" className="underline">Зарегистрироваться</Link>
          </p>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          {errors.length > 0 && (
            <div className="text-input text-red">
              {errors.map((message, i) => (
                <p key={i}>{message}</p>
              ))}
            </div>
          )}

          <Input
            name="email"
            type="email"
            placeholder="Логин"
            required
            clearable
            value={formData.email}
            onChange={handleChange}
            error={Boolean(fieldErrors.email) || invalidCredentials}
            errorMessage={fieldErrors.email}
          />

          <Input
            name="password"
            type="password"
            placeholder="Пароль"
            required
            clearable
            value={formData.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password) || invalidCredentials}
            errorMessage={fieldErrors.password}
          />

          <div className="pt-4">
            <Button
                type="submit"
                label={loading ? "Вход..." : "Войти"}
                width="100%"
                height="51px"
                labelClassName="text-button"
                disabled={loading}
            />
          </div>

          <p className="text-2 text-black text-center pt-4">
            Забыли пароль? <Link href="/reset" className="underline">Восстановить</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
