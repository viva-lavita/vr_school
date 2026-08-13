"use client";

import Image from "next/image";
import Button from "@/shared/components/Button/Button";
import { useUser } from "@/shared/context/UserContext";

export default function Main() {
  const { user } = useUser();

  return (
    <div className="-mt-[86px] pt-[86px] mx-[calc(50%-50vw)] bg-black">
      <div className="text-center items-center md:items-start md:text-left page-container flex justify-between pt-8 pb-20 lg:pb-[82px] lg:pt-15 md:pb-[73px] md:pt-15 min-[1920px]:pt-30! min-[1920px]:pb-39! flex-col-reverse md:flex-row">
        <div className="flex flex-col justify-center items-center md:items-start md:self-center">
          <div className="text-marginalia text-gray pb-2">Старшие классы</div>
          <div className="text-h1 text-green pb-2">Цифровая школа</div>
          <div className="text-h2 text-white min-[1920px]:pb-20 md:pb-12 pb-7">Знания через видео, практику и&nbsp;виртуальные эксперименты</div>
          <Button
            label="Начать обучение"
            href={user ? "/lessons" : "/login"}
            width="278px"
            height="66px"
            labelClassName="text-button"
            icon={<Image src="/icons/vr/vr-glass.svg" alt="" width={24} height={24} />}
            iconPosition="right"
          />
        </div>
        <div className="bg-dark pt-4 px-4 rounded-4xl shrink-0 w-fit mb-10 md:mb-0">
          <Image
            src="/images/vr-headset-portrait.png"
            alt=""
            className="rounded-[26px] w-[236px] h-[218px] lg:w-[269px] lg:h-[246px] min-[1920px]:w-[415px]! min-[1920px]:h-[380px]!"
            width={415}
            height={380}
          />
          <div className="text-light-green text-h4 justify-center text-center min-[1920px]:pt-15 min-[1920px]:pb-15 lg:pt-[28px] lg:pb-10 md:pt-7 md:pb-10 pt-7 pb-10">
            <p>Учиться становится ещё</p>
            <p>интереснее</p>
          </div>
        </div>
      </div>
    </div>
  );
}
