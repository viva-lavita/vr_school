"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import { ApiError } from "@/shared/api/client";
import { confirmPasswordReset, confirmProfilePasswordChange } from "@/shared/api/auth";
import { isValidNewPassword, PASSWORD_REQUIREMENTS } from "@/shared/utils/password";

const REQUIRED_MESSAGE = "Поле должно быть заполненным";
const INVALID_LINK_MESSAGE = "Ссылка недействительна или срок её действия истёк. Запросите новую ссылку.";
const initialFormData = {
  current_password: "",
  new_password: "",
  re_new_password: "",
};

function validateForm(formData, profileChange) {
  const errors = {};

  if (profileChange && !formData.current_password) {
    errors.current_password = REQUIRED_MESSAGE;
  }
  if (!formData.new_password) {
    errors.new_password = REQUIRED_MESSAGE;
  } else if (!isValidNewPassword(formData.new_password)) {
    errors.new_password = PASSWORD_REQUIREMENTS;
  }
  if (!formData.re_new_password) {
    errors.re_new_password = REQUIRED_MESSAGE;
  } else if (formData.new_password !== formData.re_new_password) {
    errors.re_new_password = "Пароли не совпадают";
  }

  return errors;
}

function firstMessage(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.find((item) => typeof item === "string") || "";
  return "";
}

export default function PasswordChangeForm({ profileChange = false }) {
  const router = useRouter();
  const { uid, token } = useParams();
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const requestLinkPath = profileChange ? "/profile/change-password" : "/reset";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(formData, profileChange);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (typeof uid !== "string" || typeof token !== "string") {
      setError(INVALID_LINK_MESSAGE);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        uid,
        token,
        new_password: formData.new_password,
        re_new_password: formData.re_new_password,
      };
      if (profileChange) {
        await confirmProfilePasswordChange({ ...payload, current_password: formData.current_password });
        router.replace("/profile/information");
      } else {
        await confirmPasswordReset(payload);
        router.replace("/login");
      }
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setError("Не удалось связаться с сервером. Попробуйте позже.");
        return;
      }
      const data = err.data && typeof err.data === "object" ? err.data : {};
      if (data.uid || data.token || err.status === 404 || err.status === 410) {
        setError(INVALID_LINK_MESSAGE);
      } else if (profileChange && err.status === 401) {
        setError("Сеанс завершён. Войдите снова и запросите новую ссылку.");
      } else if (err.status >= 500) {
        setError("Сервер временно недоступен. Попробуйте позже.");
      } else {
        const serverErrors = {};
        if (data.current_password) serverErrors.current_password = "Введен неверный пароль";
        if (data.new_password) serverErrors.new_password = firstMessage(data.new_password) || PASSWORD_REQUIREMENTS;
        if (data.re_new_password) serverErrors.re_new_password = "Пароли не совпадают";
        setFieldErrors(serverErrors);
        if (Object.keys(serverErrors).length === 0) {
          setError(firstMessage(data.non_field_errors) || firstMessage(data.detail) || "Не удалось сменить пароль. Проверьте данные и попробуйте снова.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 md:py-30">
      <div className="w-full md:w-[661px] lg:w-[685px] bg-light-green px-5 md:px-12 rounded-4xl py-12 md:py-15">
        <h1 className="text-h3 text-black uppercase pb-7 text-center">
          {profileChange ? "Изменить пароль" : "Восстановление пароля"}
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <p className="text-2 text-black">{PASSWORD_REQUIREMENTS}</p>

          {error && (
            <div className="text-input text-red" role="alert">
              <p>{error}</p>
              {error === INVALID_LINK_MESSAGE && (
                <Link href={requestLinkPath} className="underline">Запросить новую ссылку</Link>
              )}
              {profileChange && error.startsWith("Сеанс завершён") && (
                <Link href="/login" className="underline">Войти</Link>
              )}
            </div>
          )}

          {profileChange && (
            <Input
              name="current_password"
              type="password"
              placeholder="Введите старый пароль"
              aria-label="Старый пароль"
              autoComplete="current-password"
              required
              value={formData.current_password}
              onChange={handleChange}
              error={Boolean(fieldErrors.current_password)}
              errorMessage={fieldErrors.current_password}
            />
          )}

          <Input
            name="new_password"
            type="password"
            placeholder="Введите новый пароль"
            aria-label="Новый пароль"
            autoComplete="new-password"
            required
            value={formData.new_password}
            onChange={handleChange}
            error={Boolean(fieldErrors.new_password)}
            errorMessage={fieldErrors.new_password}
          />

          <Input
            name="re_new_password"
            type="password"
            placeholder="Еще раз введите новый пароль"
            aria-label="Повторите новый пароль"
            autoComplete="new-password"
            required
            value={formData.re_new_password}
            onChange={handleChange}
            error={Boolean(fieldErrors.re_new_password)}
            errorMessage={fieldErrors.re_new_password}
          />

          <div className="pt-4">
            <Button
              type="submit"
              label={saving ? "Отправка..." : "Отправить"}
              width="100%"
              height="51px"
              labelClassName="text-button"
              disabled={saving}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
