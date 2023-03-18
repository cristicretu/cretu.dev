import Image from "next/image";

export default function Home() {
  return (
    <div className="gap-8">
      <div className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 relative">
          <Image
            src="/images/nextjs.svg"
            layout="fill"
            objectFit="contain"
            alt="Logo"
          />
        </div>
        <div className="flex flex-col">
          <h1>Cristian Crețu</h1>
          <p className="text-gray-500">Design Engineer in Europe</p>
        </div>
      </div>
    </div>
  );
}
