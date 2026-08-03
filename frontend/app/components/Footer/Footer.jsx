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

        <Link href="/privacy" className="[grid-area:privacy] self-end text-input text-gray">
          Политика конфиденциальности
        </Link>

        <p className="[grid-area:copyright] self-end text-input text-gray">
          © 2026. МБОУ «Гимназия №11» г.&nbsp;Махачкала
        </p>

        <div className="[grid-area:madeby] self-end flex flex-row lg:flex-col items-center lg:items-start gap-2">
          <img src="/footer-images/sot.svg" alt="Сот.рф" className="w-[42px] h-[25px]" />
          <img src="/footer-images/made.svg" alt="Сделано в TEAMCODE" className="w-[271px] h-6" />
        </div>
      </div>
    </footer>
  );
}
