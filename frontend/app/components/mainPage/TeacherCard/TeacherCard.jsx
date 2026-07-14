import Image from "next/image";

export default function TeacherCard({ name, photo, about, achievements = [] }) {
  return (
    <div className="bg-dark rounded-4xl p-4 flex flex-col md:flex-row gap-4 md:gap-[30px] w-1/1">
      <Image
        src={photo}
        alt={name}
        width={312}
        height={377}
        className="rounded-[26px] shrink-0 w-full h-auto aspect-[312/377] object-cover md:w-[312px] md:h-[377px] md:aspect-auto"
      />
      <div className="min-w-0">
        <p className="text-h4 text-white pt-3 uppercase">{name}</p>
        {achievements.length > 0 && (
          <ul className="text-card text-gray pt-3 list-disc list-outside space-y-1 pb-5 pl-0 ml-6">
            {achievements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        <p className="text-card text-gray">{about}</p>
      </div>
    </div>
  );
}
