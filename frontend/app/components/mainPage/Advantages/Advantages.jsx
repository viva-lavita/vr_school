import Image from "next/image";
import Button from "@/shared/components/Button/Button";

export default function Advantages() {
  return (
    <div className="mx-[calc(50%-50vw)] bg-white lg:py-40 py-20">
      <div className="page-container">
        <div className="lg:pb-15 pb-7 text-center md:text-start">
          <p className="text-marginalia text-dark pb-2 uppercase">Преимущества метода</p>
          <p className="text-h2 text-black">Почему мы используем <span className="text-green">ВР на уроках</span></p>
        </div>

        <div className="grid lg:grid-cols-2 min-[1920px]:grid-cols-3 gap-[30px]">
          <div className="h-[360px] bg-[linear-gradient(302.96deg,#151515_0%,#3E3E3E_49.45%,#7B7B7B_123.92%)] p-[28px] rounded-4xl flex flex-col justify-between">
            <Image src="/icons/vr/vr-1.svg" alt="" width={44} height={44} />
            <div>
              <p className="text-white text-h4 uppercase pb-4">Погружение в учебную ситуацию</p>
              <p className="text-gray text-2">ВР позволяет ученикам «оказаться» в изучаемой среде, например, виртуально посетить Лондон и описывать увиденное на английском языке.</p>
            </div>
          </div>

          <div className="h-[360px] bg-[linear-gradient(302.96deg,#151515_0%,#3E3E3E_49.45%,#7B7B7B_123.92%)] p-[28px] rounded-4xl flex flex-col justify-between">
            <Image src="/icons/vr/vr-2.svg" alt="" width={44} height={44} />
            <div>
              <p className="text-white text-h4 uppercase pb-4">Развитие устной речи через наблюдение</p>
              <p className="text-gray text-2">Ученики описывают то, что видят в виртуальной среде, отвечают на вопросы и обсуждают впечатления, что помогает развивать навыки Speaking и Listening.</p>
            </div>
          </div>

          <div className="h-[360px] bg-[linear-gradient(302.96deg,#151515_0%,#3E3E3E_49.45%,#7B7B7B_123.92%)] p-[28px] rounded-4xl flex flex-col justify-between">
            <Image src="/icons/vr/vr-3.svg" alt="" width={44} height={44} />
            <div>
              <p className="text-white text-h4 uppercase pb-4">Разные форматы заданий после просмотра</p>
              <p className="text-gray text-2">После ВР-видео ученики выполняют задания: True/False, тесты, задания на соответствие, заполнение пропусков, а также письменные ответы.</p>
            </div>
          </div>
        </div>

        <div className="pt-7 mb:pt-10 lg:pt-12 min-[1920px]:pt-15 flex justify-center">
          <Button
            label="Начать обучение"
            href="/login"
            width="278px"
            labelClassName="text-button"
            icon={<Image src="/icons/vr/vr-glass.svg" alt="" width={24} height={24} />}
            iconPosition="right"
          />
        </div>
      </div>
    </div>
  );
}
