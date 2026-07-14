import Image from "next/image";
import Button from "@/shared/components/Button/Button";

export default function Registration() {
  return (
    <div className="relative mx-[calc(50%-50vw)] overflow-hidden h-[360px] md:h-[560px] lg:h-[600px] min-[1920px]:785px">
      <Image
        src="/images/students-vr-duo.png"
        alt=""
        fill
        className="object-cover scale-110 -z-20"
      />
      <div className="absolute inset-0 bg-[rgba(34,34,34,0.65)] -z-10" />

      <div className="page-container relative py-[68px] mb:py-[184px] lg:py-[186px] min-[1920px]:py-[250px]">
        <div className="flex flex-col items-center text-center gap-7 mb:gap-7 lg:gap-12 min-[1920px]:gap-15">
          <p className="text-h2 text-white w-9/10">
            Изучайте материал в интерактивном формате, выполняйте задания и закрепляйте знания на&nbsp;практике
          </p>

          <Button
            label="Зарегестрироваться"
            width="314px"
            labelClassName="text-button"
            icon={<Image src="/icons/vr/vr-glass.svg" alt="" width={24} height={24} />}
            iconPosition="right"
          />
        </div>
      </div>
    </div>
  );
}
