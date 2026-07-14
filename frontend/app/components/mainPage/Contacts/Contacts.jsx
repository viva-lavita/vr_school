"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/shared/components/Button/Button";

export default function Contacts() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const isDisabled = !name.trim() || !email.trim() || !consent;

  return (
    <div className="mx-[calc(50%-50vw)] bg-white">
      <div className="page-container py-40 flex min-[1920px]:flex-row flex-col gap-[30px]">
        <div className="relative overflow-hidden h-[522px] bg-[linear-gradient(302.96deg,#151515_0%,#3E3E3E_49.45%,#7B7B7B_123.92%)] p-7 md:p-10 rounded-4xl min-[1920px]:w-1/2">
          <div className="text-white text-h3 pb-10 text-center"><span className="text-green">Контакты</span> и&nbsp;обратная связь</div>
          <div className="flex flex-col">
            <p  className="text-gray text-marginalia pb-2 uppercase">Телефон</p>
            <p className="text-white text-h4 pb-7">+7 (8722) 63-76-41</p>
            <p  className="text-gray text-marginalia pb-2 uppercase">Эленктронная почта</p>
            <p  className="text-white text-h4 pb-7">mbou_gimnaziya11@e-dag.ru</p>

            <div className="flex items-center gap-4">
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

            <div className="absolute left-5 bottom-6 flex flex-wrap gap-2 max-w-[85%] pointer-events-none select-none">
              <span className="-rotate-6 rounded-full border border-orange bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#школьныепредметы</span>
              <span className="-rotate-3 rounded-full border border-green bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#виртуальнаяреальность</span>
              <span className="rotate-2 rounded-full border border-green bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#изучениеанглийского</span>
              <span className="-rotate-2 rounded-full border border-orange bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#ВРобучение</span>
              <span className="rotate-3 rounded-full border border-green bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#обучениехимии</span>
              <span className="-rotate-4 rounded-full border border-orange bg-black px-4 py-[6px] text-[12px] leading-none whitespace-nowrap text-white">#видеоуроки</span>
            </div>
          </div>
          <Image
            src="/images/vr-headset-cutout-clear.png"
            alt=""
            width={780}
            height={520}
            className="absolute bottom-0 right-5 w-[175px] h-[225px] md:w-[310px] md:h-[397px]"
          />
        </div>

        <div className="h-[577px] md:h[522px] bg-[linear-gradient(72.9deg,#151515_0%,#3E3E3E_49.45%,#7B7B7B_123.92%)] p-7 md:p-10 rounded-4xl min-[1920px]:w-1/2">
          <p className="text-white text-inter text-center md:text-start">Напишите нам через форму или свяжитесь дюбым удобным способом</p>

          <div className="flex flex-col gap-1.5 py-5">
            <input name="name" placeholder="Имя и фамилия*" value={name} onChange={(e) => setName(e.target.value)} className="h-[38px] w-full bg-transparent border-b border-white/25 px-[10px] text-input text-white placeholder-gray outline-none focus:border-white/60" />
            <input name="email" type="email" placeholder="Электронная почта*" value={email} onChange={(e) => setEmail(e.target.value)} className="h-[38px] w-full bg-transparent border-b border-white/25 px-[10px] text-input text-white placeholder-gray outline-none focus:border-white/60" />
            <input name="phone" type="tel" placeholder="+7 (900) 000-00-00" className="h-[38px] w-full bg-transparent border-b border-white/25 px-[10px] text-input text-white placeholder-gray outline-none focus:border-white/60" />
            <textarea name="comment" placeholder="Написать комментарий" rows={1} className="h-[95px] w-full mt-4 bg-transparent border-b border-white/25 px-[10px] pt-[64px] pb-[10px] text-input text-white placeholder-gray outline-none focus:border-white/60 resize-none" />

            <label className="flex items-start gap-3 cursor-pointer pt-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 appearance-none rounded-[2px] bg-gray checked:bg-[url('/icons/ui/check.svg')] checked:bg-no-repeat checked:bg-center cursor-pointer"
              />
              <span className="text-gray text-input">
                Я подтверждаю ознакомление с Политикой и даю согласие на обработку персональных данных в порядке и на условиях, указанных в Политике.
              </span>
            </label>
          </div>


          <div className="flex justify-center pt-2">
            <Button
              label="Отправить"
              width="180px"
              labelClassName="text-button"
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
