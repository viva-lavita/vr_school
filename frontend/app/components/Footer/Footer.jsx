import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-text">
      <div className={`page-container ${styles.footerGrid} gap-x-6 gap-y-4 content-between items-start py-10`}>
        <img
          src="/icons/logo/logo.svg"
          alt="logo"
          className="[grid-area:logo]"
        />

        <div className="[grid-area:contacts] min-[1920px]:contents flex flex-col gap-5">
          <div className="min-[1920px]:[grid-area:phone] flex flex-col gap-1">
            <span className="text-marginalia text-gray">ТЕЛЕФОН</span>
            <p className="text-h4 text-white">+7 (8522) 63-76-41</p>
          </div>
          <div className="min-[1920px]:[grid-area:email] flex flex-col gap-1">
            <span className="text-marginalia text-gray">ЭЛЕКТРОННАЯ ПОЧТА</span>
            <p className="text-h4 text-white">mbou_gimnaziya11@e-dag.ru</p>
          </div>
        </div>

        <div className="[grid-area:social] flex items-center gap-4">
          <a href="#" className="size-[42px] rounded-lg bg-light-green flex items-center justify-center">
            <img src="/icons/social/telegram.svg" alt="Telegram" className="size-[26px]" />
          </a>
          <a href="#" className="size-[42px] rounded-lg bg-light-green flex items-center justify-center">
            <img src="/icons/social/max.svg" alt="MAX" className="size-[26px]" />
          </a>
          <a href="#" className="size-[42px] rounded-lg bg-light-green flex items-center justify-center">
            <img src="/icons/social/vk.svg" alt="VK" className="size-[26px]" />
          </a>
        </div>

        <div className="[grid-area:privacy] self-end flex flex-col gap-1">
          <Link href="/privacy" className="text-input text-gray">
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="text-input text-gray">
            Пользовательское соглашение
          </Link>
        </div>

        <p className="[grid-area:copyright] self-end text-input text-gray">
          © 2026. МБОУ «Гимназия №11» г.&nbsp;Махачкала
        </p>

        <div className="[grid-area:madeby] self-end flex flex-row lg:flex-col items-center lg:items-start gap-2">
          <img src="/footer-images/sot.svg" alt="Сот.рф" className="w-[42px] h-[25px]" />
          <div className="relative h-6 w-[271px] shrink-0">
            <img src="/footer-images/made.svg" alt="" className="h-6 w-[271px]" />
            <span className="sr-only">Сделано в</span>
            <a
              href="https://xn--g1ani7c.xn--p1ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-y-0 left-[70px] w-[107px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="sr-only">СОЮЗ.РФ</span>
            </a>
            <a
              href="https://xn--g1ani7c.xn--p1ai/%D0%BB%D0%BA/%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%8B/2921529416099541128?name=%D0%A2%D0%B5%D1%85+%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D0%B8+%D0%9C%D0%B5%D1%87%D1%82%D1%8B+%D0%9A%D0%9E%D0%94&space=622"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-y-0 left-[200px] right-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="sr-only">ТИМ КОД</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
