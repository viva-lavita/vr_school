import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center md:items-start text-center md:text-left gap-[40px] pt-[40px] px-[16px] pb-0 md:p-[40px] lg:p-15 bg-black mt-12 mb-20 rounded-4xl">
      <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-1/2 gap-4">
        <p className="text-h1 text-green">404</p>
        <p className="text-h2 text-white">Похоже, урок пошёл не по расписанию</p>
        <p className="text-2 text-gray">Страница не найдена или была перемещена. Вернитесь на главную и продолжите обучение.</p>
        {/* TODO: Сделать компонент для кнопок */}
        <Link href="/" className="text-2 underline">
          Вернуться на главную
        </Link>
      </div>

      <Image
        src="/images/vr-headset-cutout.png"
        alt=""
        width={780}
        height={520}
        className="md:absolute md:bottom-0 md:right-0 w-[320px] h-[227px] md:w-[422px] md:h-[298px] lg:w-[557px] lg:h-[385px] min-[1920px]:w-[780px] min-[1920px]:h-[520px]"
      />
    </div>
  );
}
