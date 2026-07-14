export default function About() {
  return (
    <div className="mx-[calc(50%-50vw)] bg-white">
      <div className="page-container md:py-40 py-20">
        <p className="text-dark text-marginalia uppercase pb-2 text-center md:text-start">О проекте</p>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 text-eco2 text-dark text-center md:text-start pb-7 md:pb-">
            <span className="text-green uppercase">ВР-уроки для детей</span>, помощь для учителей
          </div>
          <div className="md:w-1/2 text-2 text-dark">
            <div className="pb-12">
              Наша платформа — это не просто онлайн-школа с видеоуроками. Это экосистема обучения нового поколения, где искусственный интеллект подстраивает программу под каждого ученика, а виртуальная реальность создаёт безопасную среду для практики без страха ошибок.
            </div>
            <div>
              Мы объединяем технологии ВР и ИИ, чтобы школьники могли изучать естественно-научные, гуманитарные и технические предметы через интерактивное погружение и симуляцию реальных процессов. Учителя получают готовые планы уроков, задания и инструменты для контроля знаний, а ученики — увлекательный и эффективный способ учиться.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
