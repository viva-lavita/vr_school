import { montserrat } from "@/lib/fonts";
import { inter } from "@/lib/fonts";
import Link from "next/link";

export default function Footer() {
  return (
    <div
      className="w-screen h-53.5"
      style={{ backgroundColor: "#F6FFDE" }}
    >
      <footer
        className={`${montserrat.className} flex w-[1400px] pt-10 pb-4 mx-auto h-full justify-between`}
        style={{ color: "#040404" }}
      >
        <div className="flex flex-col justify-between mr-[5%]">
          <div className={`font-semibold text-lg flex flex-col gap-2`}>
            <p>+7 3822 71-67-69</p>
            <p>perspectiva@education70.ru</p>
          </div>
          <p className={`font-normal text-sm`}>
            © 2025 МАОУ Школа «Перспектива» г. Томск
          </p>
        </div>
        <div className={`font-medium text-base flex flex-col gap-2 mr-[13%]`}>
          <nav>
            <ul>
              <li>
                <Link href="/about">О проекте</Link>
              </li>
              <li>
                <Link href="/news">Новости</Link>
              </li>
              <li>
                <Link href="/catalog">Каталог материалов</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex flex-col justify-between mr-[15%]">
          <div className="text-base font-medium flex flex-col gap-2">
            <nav>
              <ul>
                <li>
                  <Link href="/qa">Вопрос-ответ</Link>
                </li>
                <li>
                  <Link href="/contacts">Контакты</Link>
                </li>
              </ul>
            </nav>
          </div>
          <p className={`text-sm font-normal`}>Designed by Freepik</p>
        </div>
        <div className="flex flex-col justify-between">
          <div className="text-base font-medium flex flex-col gap-2">
            <nav>
              <ul>
                <li>
                  <Link href="/terms">Пользовательское соглашение</Link>
                </li>
                <li>
                  <Link href="/privacy">Политика конфиденциальности</Link>
                </li>
              </ul>
            </nav>
          </div>
          <p
            className={`${inter.className} text-xs font-medium flex items-center gap-2`}
          >
            Сделано в
            <img
              src="/footer-images/logo.svg"
              alt="1t"
              className="w-[28.8px] h-6 inline-block"
            />
            <img
              src="/footer-images/union.svg"
              alt="Союз рф"
              className="w-[70px] h-[10.5px] inline-block"
            />
            | TEAMCODE
          </p>
        </div>
      </footer>
    </div>
  );
}
