import TeacherCard from "../TeacherCard/TeacherCard";
import teachers from "./teachers";

export default function Team() {
  return (
    <div className="mx-[calc(50%-50vw)] bg-black md:py-40 py-20">
      <div className="page-container">
        <div className="md:w-3/4 text-center md:text-start">
          <p className="text-gray text-marginalia uppercase pb-2">Автор и команда проекта</p>
          <p className="text-h2 text-white">
            Наша команда <span className="text-green">создаёт ВР-уроки</span>, чтобы учиться было <span className="text-green">интересно и понятно</span>
          </p>
        </div>

        <div className="grid min-[1400px]:grid-cols-2 min-[1400px]:gap-[30px] gap-[20px] min-[1400px]:pt-12 pt-7">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} {...teacher} />
          ))}
        </div>
      </div>
    </div>
  );
}
