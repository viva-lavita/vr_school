"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="page-container menu-items text-white text-base grid grid-cols-3 md:flex items-center mt-[20px] bg-dark rounded-lg px-[20px] lg:px-7">
      <img
        src="/icons/logo/logo.svg"
        alt="logo"
        className="size-[66px] justify-self-start"
      />

      <nav className="hidden md:flex items-center ml-[clamp(138px,calc(138px+(238px-138px)*(100vw-768px)/(1920px-768px)),238px)]">
        <ul className="flex gap-7 h-5">
          <li><Link href="/news">Команда</Link></li>
          <li><Link href="/about">О проекте</Link></li>
          <li><Link href="/contacts">Контакты</Link></li>
        </ul>
      </nav>

      <div className="flex items-center gap-2 justify-self-center md:ml-auto">
        <span>Войти</span>
        <img src="/icons/ui/avatar.svg" alt="search" className="size-[40px]" />
      </div>

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
              <li><Link href="/news" onClick={() => setMenuOpen(false)}>Команда</Link></li>
              <li><Link href="/about" onClick={() => setMenuOpen(false)}>О проекте</Link></li>
              <li><Link href="/contacts" onClick={() => setMenuOpen(false)}>Контакты</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
