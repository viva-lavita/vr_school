"use client";

import { useState } from "react";
import Link from "next/link";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Loader from "@/shared/components/Loader/Loader";
import Popup from "@/shared/components/Popup/Popup";
import { requestPasswordReset } from "@/shared/api/auth";

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Неверный email";

function validateForm(formData) {
  const fieldErrors = {};

  if (!formData.email.trim()) {
    fieldErrors.email = REQUIRED_MESSAGE;
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    fieldErrors.email = EMAIL_ERROR;
  }

  return fieldErrors;
}

const initialFormData = {
  email: "",
};

export default function ResetPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      <div className="flex items-center justify-center py-30">
        <div className="w-full md:w-[661px] lg:w-[685px] bg-light-green px-5 md:px-12 rounded-4xl p-15">
          {saving ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader size={86} />
            </div>
          ) : (
            <>
          <p className="text-h3 text-black uppercase pb-4 text-center">Восстановление пароля</p>
          <p className="text-2 text-black text-center pb-7">
            Введите адрес электронной почты, который вы использовали для входа. Мы отправим на него ссылку для смены пароля.
          </p>

          {error && (
            <p className="text-input text-red text-center pb-4">{error}</p>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
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

            <Button
              type="submit"
              label="Отправить"
              width="100%"
              height="51px"
              labelClassName="text-button"
              disabled={saving}
            />

            <p className="text-2 text-black text-center pt-1">
              Вспомнили пароль? <Link href="/login" className="underline">Войти</Link>
            </p>
          </form>
            </>
          )}
        </div>
      </div>

      <Popup open={success} onClose={() => setSuccess(false)}>
        <p className="text-h4 text-black text-center">Ссылка на восстановление отправлена</p>
        <p className="text-2 text-black text-center pt-8">
          Если указанный email зарегистрирован в системе, мы отправим на него письмо с инструкцией
        </p>
      </Popup>
    </>
  );
}
