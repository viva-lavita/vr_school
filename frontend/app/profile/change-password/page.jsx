"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Loader from "@/shared/components/Loader/Loader";
import Popup from "@/shared/components/Popup/Popup";
import { ApiError } from "@/shared/api/client";
import { logoutUser, requestProfilePasswordChange } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading, setUser } = useUser();
  const [emailInput, setEmailInput] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const email = emailInput ?? user?.email ?? "";

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldError(REQUIRED_MESSAGE);
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFieldError("Введите корректный email");
      return;
    }
    if (user?.email && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) {
      setFieldError("Укажите email вашего профиля");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await requestProfilePasswordChange({ email: trimmedEmail });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Сеанс завершён. Войдите снова.");
      } else if (err instanceof ApiError && err.status === 400) {
        setFieldError("Укажите email вашего профиля");
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Слишком много запросов. Попробуйте позже.");
      } else {
        setError("Не удалось отправить письмо. Попробуйте позже.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center flex-col">
        <div className="w-full flex flex-col-reverse md:flex-col gap-[15px] md:gap-[22px] py-7 md:pt-15 md:pb-4">
          <h1 className="text-h3 text-black uppercase text-center md:text-left">Изменить пароль</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-end gap-2 text-input text-black cursor-pointer"
          >
            <img src="/icons/ui/exit.svg" alt="" className="w-[12px] h-[11px]" />
            Выйти из профиля
          </button>
        </div>
        <div className="w-full bg-light-green px-4 md:px-12 lg:px-15 rounded-4xl py-10 md:pb-5 mb-20">
          {loading || saving ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader size={86} />
            </div>
          ) : !user ? (
            <div className="text-2 text-black text-center py-12">
              Сеанс завершён. <Link href="/login" className="underline">Войти снова</Link>
            </div>
          ) : (
            <form className="flex flex-col gap-3 mx-auto md:w-[541px] lg:w-[622px] xl:w-[686px]" onSubmit={handleSubmit} noValidate>
              <p className="text-2 text-black pb-5 text-center">
                Введите адрес электронной почты, который вы использовали для входа. Мы отправим на него ссылку для смены пароля.
              </p>

              {error && (
                <p className="text-input text-red text-center pb-3" role="alert">
                  {error} {error.startsWith("Сеанс завершён") && <Link href="/login" className="underline">Войти</Link>}
                </p>
              )}

              <Input
                name="email"
                type="email"
                placeholder="Введите электронную почту"
                aria-label="Электронная почта"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmailInput(event.target.value);
                  setFieldError("");
                  setError("");
                }}
                error={Boolean(fieldError)}
                errorMessage={fieldError}
              />

              <div className="justify-center flex pt-7">
                <Button
                  type="submit"
                  label="Отправить"
                  width="182px"
                  height="51px"
                  labelClassName="text-button"
                  disabled={saving}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      <Popup open={success} onClose={() => setSuccess(false)}>
        <p className="text-h4 text-black text-center">Ссылка для смены пароля отправлена</p>
        <p className="text-2 text-black text-center pt-8">Проверьте электронную почту и перейдите по ссылке из письма.</p>
      </Popup>
    </>
  );
}
