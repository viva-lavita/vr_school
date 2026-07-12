import Image from "next/image";
import Button from "@/shared/components/Button/Button";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center md:items-start text-center md:text-left gap-[40px] pt-[40px] px-[16px] pb-0 md:p-[40px] lg:p-15 min-[1920px]:px-[120px]! min-[1920px]:py-[80px]! bg-black mt-12 mb-20 rounded-4xl">
      <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-1/2">
        <p className="text-h1 text-green pb-2">404</p>
        <p className="text-h2 text-white pb-3 lg:pb-5">Похоже, урок пошёл не по расписанию</p>
        <p className="text-2 text-gray pb-10">Страница не найдена или была перемещена. Вернитесь на главную и продолжите обучение.</p>
        <Button 
          href="/" 
          label="Вернуться на главную" 
          width="294px" 
          labelClassName="text-button"
        />
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
