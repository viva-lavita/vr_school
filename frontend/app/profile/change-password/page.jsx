"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Loader from "@/shared/components/Loader/Loader";
import Popup from "@/shared/components/Popup/Popup";
import { logoutUser, requestPasswordReset } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Введите корректный email";

function validateForm(formData) {
  const fieldErrors = {};

  if (!formData.email) {
    fieldErrors.email = REQUIRED_MESSAGE;
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    fieldErrors.email = EMAIL_ERROR;
  }

  return fieldErrors;
}

const initialFormData = {
  email: "",
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setSaving(true);
    setError("");
    try {
      await requestPasswordReset({ email: formData.email.trim() });
      setFormData(initialFormData);
      setSuccess(true);
    } catch (err) {
      if (err.status >= 500) {
        setError("Сервер временно недоступен. Попробуйте позже.");
      } else {
        setFormData(initialFormData);
        setSuccess(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center flex-col">
        <div className="w-full flex flex-col-reverse md:flex-col gap-[15px] md:gap-[22px] py-7 md:pt-15 md:pb-4">
          <p className="text-h3 text-black uppercase text-center md:text-left">Изменить пароль</p>
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
          {saving ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader size={86} />
            </div>
          ) : (
          <form className="flex flex-col gap-3 mx-auto md:w-[541px] lg:w-[622px] xl:w-[686px]" onSubmit={handleSubmit} noValidate>
            <p className="text-2 text-black pb-5 text-center">
              Введите адрес электронной почты, который вы использовали для входа. Мы отправим на него ссылку для смены пароля.
            </p>

            {error && (
              <p className="text-input text-red text-center pb-3">{error}</p>
            )}

            <Input
              name="email"
              type="email"
              placeholder="Введите электронную почту"
              clearable
              value={formData.email}
              onChange={handleChange}
              error={Boolean(fieldErrors.email)}
              errorMessage={fieldErrors.email}
            />

            <div className="justify-center flex pt-7">
              <Button
                type="submit"
                label={saving ? "Отправка..." : "Отправить"}
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
        <p className="text-h4 text-black text-center">Ссылка на восстановление отправлена</p>
        <p className="text-2 text-black text-center pt-8">Если указанный email зарегистрирован в системе, мы отправим на него письмо с инструкцией</p>
      </Popup>
    </>
  );
}
