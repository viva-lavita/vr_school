"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { logoutUser } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";
import Button from "@/shared/components/Button/Button";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, setUser } = useUser();

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 page-container menu-items text-white text-base grid grid-cols-3 md:flex items-center mt-[20px] bg-dark rounded-lg px-[20px] lg:px-7">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="justify-self-start cursor-pointer"
      >
        <img
          src="/icons/logo/logo.svg"
          alt="logo"
          className="size-[66px]"
        />
      </button>

      <nav className="hidden md:flex items-center ml-[clamp(138px,calc(138px+(238px-138px)*(100vw-768px)/(1920px-768px)),238px)]">
        <ul className="flex gap-7 h-5">
          <li><Link href="/#team">Команда</Link></li>
          <li><Link href="/#about">О проекте</Link></li>
          <li><Link href="/#contacts">Контакты</Link></li>
        </ul>
      </nav>

      {user ? (
        <button
          type="button"
          onClick={() => setUserMenuOpen(true)}
          className="flex items-center gap-2 justify-self-center md:ml-auto cursor-pointer"
        >
          <span className="menu-items">{user.first_name} {user.last_name}</span>
          <img src="/icons/ui/avatar.svg" alt="" className="size-[40px]" />
        </button>
      ) : (
        <Link href="/login" className="flex items-center gap-2 justify-self-center md:ml-auto">
          <span>Войти</span>
          <img src="/icons/ui/avatar.svg" alt="" className="size-[40px]" />
        </Link>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Открыть меню"
        className="flex md:hidden justify-self-end"
      >
        <img src="/icons/ui/menu.svg" alt="" className="size-[40px]" />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute top-0 right-0 w-[320px] h-full bg-black p-[28px]">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
              className="absolute top-0 right-0 p-[12px]"
            >
              <img src="/icons/ui/close.svg" alt="" className="size-[24px]" />
            </button>
            <ul className="menu-items text-white flex flex-col gap-7">
              <li><Link href="/#team" onClick={() => setMenuOpen(false)}>Команда</Link></li>
              <li><Link href="/#about" onClick={() => setMenuOpen(false)}>О проекте</Link></li>
              <li><Link href="/#contacts" onClick={() => setMenuOpen(false)}>Контакты</Link></li>
            </ul>
          </nav>
        </div>
      )}

      {userMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setUserMenuOpen(false)}
          />
          <nav className="absolute top-0 right-0 md:w-[480px] w-[320px] h-full bg-white p-[28px]">
            <button
              type="button"
              onClick={() => setUserMenuOpen(false)}
              aria-label="Закрыть меню"
              className="absolute top-0 right-0 p-[12px]"
            >
              <img src="/icons/ui/x.svg" alt="" className="size-[24px]" />
            </button>
            <p className="text-h4 text-black pb-7">Профиль</p>
            <p className="text-inter text-black">{user.first_name} {user.last_name}</p>
            <div className="h-[1px] w-full bg-gray mt-5 mb-10"></div>

            <ul className="menu-items text-black flex flex-col gap-2 mb-15">
              <li><Link href="/profile/information" onClick={() => setUserMenuOpen(false)}>Мои данные</Link></li>
              <li><Link href="/lessons" onClick={() => setUserMenuOpen(false)}>Каталог уроков</Link></li>
              <li><Link href="/profile/change-password" onClick={() => setUserMenuOpen(false)}>Изменение пароля</Link></li>
            </ul>
            <div>
              <Button
                label="Выйти из профиля"
                onClick={handleLogout}
                height="43px"
                labelClassName="text-button text-black"
                className="bg-white w-full border-2 border-black"
                iconPosition="right"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
