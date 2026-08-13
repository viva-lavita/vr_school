export default function About() {
  return (
    <div className="mx-[calc(50%-50vw)] bg-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-5 lg:px-10 py-20 lg:py-[120px] xl:py-[160px]">
        <p className="text-[#343E3D] text-[14px] leading-[17px] font-medium uppercase text-center md:text-start pb-2">
          О проекте
        </p>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-[20px] xl:gap-[30px] items-start">
          <div className="w-full lg:w-1/2 text-center lg:text-start">
            <h2 className="font-extrabold uppercase text-[22px] leading-[26px] md:text-[24px] md:leading-[29px] lg:text-[32px] lg:leading-[38px] xl:text-[44px] xl:leading-[53px]">
              <span className="text-[#22C55E]">ВР-уроки для детей</span>
              <span className="text-[#222222]">, помощь для учителей</span>
            </h2>
          </div>

          <div className="w-full lg:w-1/2 text-[#343E3D] text-[16px] leading-[140%] font-medium text-start">
            <p className="pb-7">
              Наша платформа — это не просто онлайн-школа с видеоуроками. Это экосистема обучения нового поколения, где искусственный интеллект подстраивает программу под каждого ученика, а виртуальная реальность создаёт безопасную среду для практики без страха ошибок.
            </p>
            <p>
              Мы объединяем технологии ВР и ИИ, чтобы школьники могли изучать естественно-научные, гуманитарные и технические предметы через интерактивное погружение и симуляцию реальных процессов. Учителя получают готовые планы уроков, задания и инструменты для контроля знаний, а ученики — увлекательный и эффективный способ учиться.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}