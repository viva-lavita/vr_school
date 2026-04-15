import { Montserrat } from 'next/font/google'
import Link from "next/link";

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    weight: ['500'],
    style: ['normal'],
})

export default function Header() {
  return (
      <header className={`${montserrat.className} text-base flex w-350 justify-between py-2.25 mx-auto`}>
        <img src="/images/logo.svg" alt=""/>
        <nav className="flex items-center">
          <ul className="flex gap-7 h-5">
            <li><Link href="/about">О проекте</Link></li>
            <li><Link href="/news">Новости</Link></li>
            <li><Link href="/catalog">Каталог материалов</Link></li>
            <li><Link href="/qa">Вопрос-ответ</Link></li>
            <li><Link href="/contacts">Контакты</Link></li>
          </ul>
        </nav>
        <div className="flex items-center gap-10">
          <img src="/header-images/search.svg" alt="search" className="size-9"/>
          <div className="flex gap-5">
              <img src="/header-images/vk-button.png" alt="Вконтакте"  className="size-11.5"/>
              <img src="/header-images/ok-button.png" alt="Одноклассники"  className="size-11.5"/>
          </div>
            <button className="py-3 px-6" style={{ background: "#DEEDAB" }}>
                Личный кабинет
            </button>
        </div>
      </header>
  );
}
