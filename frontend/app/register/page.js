"use client";

import { useState } from "react";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Select from "@/shared/components/Select/Select";
// TODO: подвязать к беку получение школ/классов/отправка запроса на регистрацию
export default function RegisterPage() {
  const [consentRule, setConsentRule] = useState(false);
  const [consentPD, setConsentPD] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="md:w-[685px] my-20 min-[1920px]:my-30 bg-light-green px-5 md:px-12 lg:px-15 rounded-4xl">
        <p className="text-h3 text-black uppercase pb-4 text-center pt-12 lg:pt-15">Регистрация</p>
        <p className="text-2 text-black text-center pb-8">Внимание! Регистрацию нового пользователя может осуществить только родитель или законный представитель ученика Цифровой школы.</p>

        <form className="flex flex-col gap-3 mx-auto md:mx-0">
          <p className="text-input text-black pb-1">Данные родителя/законного представителя ученика</p>

          <Input name="last_name" type="text" placeholder="Фамилия" required clearable />
          <div className="flex flex-col gap-3 md:flex-row ">
            <div className="md:w-1/2">
              <Input name="first_name" type="text" placeholder="Имя" required clearable />
            </div>
            <div className="md:w-1/2">
              <Input name="last_name" type="text" placeholder="Отчество" clearable />
            </div>
          </div>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input name="birth_date" type="date" placeholder="Дата рождения" required clearable />
            </div>
            <div className="md:w-1/2">
              <Input name="email" type="email" placeholder="Email" required clearable />          
            </div>
          </div>

          <div>
            <p>Пароль должен содержать не менее 8 символов, используйте латиницу, спецсимволы (@#$%&*!), заглавные и прописные буквы, цифры</p>
            <div className="pb-3">
              <Input name="password" type="password" placeholder="Пароль" clearable />
            </div>
            <Input name="re_password" type="password" placeholder="Повторите пароль" clearable />
          </div>
          <p className="text-input text-black pt-4">Данные ученика</p>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input name="child_last_name" type="text" placeholder="Фамилия" required clearable />
            </div>
            <div className="md:w-1/2">
              <Input name="child_first_name" type="text" placeholder="Имя" required clearable />
            </div>
          </div>
          <div className="flex flex-col gap-3  md:flex-row">
            <div className="md:w-1/2">
              <Input name="child_patronymic_name" type="text" placeholder="Отчество" clearable />
            </div>
            <div className="md:w-1/2">
              <Input name="birth_date" type="date" placeholder="Дата рождения" required clearable />
            </div>
          </div>
          <Select
            name="school"
            placeholder="Школа"
            required
            options={Array.from({ length: 11 }, (_, i) => String(i + 1))}
          />
          <Select
            name="class_number"
            placeholder="Класс"
            required
            options={Array.from({ length: 11 }, (_, i) => String(i + 1))}
          />
          <label className="flex items-start gap-3 cursor-pointer pt-3">
            <input
              type="checkbox"
              checked={consentRule}
              onChange={(e) => setConsentRule(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 appearance-none rounded-[2px] bg-white border-1 border-gray checked:bg-[url('/icons/ui/check.svg')] checked:bg-no-repeat checked:bg-center cursor-pointer"
            />
            <span className="text-black text-input">
              Ознакомлен с <span className="underline">Правилами</span> использования сайта.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer pt-3 pb-5">
            <input
              type="checkbox"
              checked={consentPD}
              onChange={(e) => setConsentPD(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 appearance-none rounded-[2px] bg-white border-1 border-gray checked:bg-[url('/icons/ui/check.svg')] checked:bg-no-repeat checked:bg-center cursor-pointer"
            />
            <span className="text-black text-input">
              Согласне с <span className="underline">Положение обработки</span> и хранения персональных данных(сюда также включены нормы, связанные с обработкой и хранением несовершенолетних).
            </span>
          </label>

          <Button label="Зарегестрироваться" width="100%" height="51px" labelClassName="text-button" />
          
          <p className="text-input text-black text-center pb-12 pt-5">Уже есть аккунт? <span className="underline">Войти в личный кабинет</span></p>
        </form>
      </div>
    </div>
  );
}
