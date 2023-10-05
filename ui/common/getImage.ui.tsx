import Image from "next/image";

interface GetImageUiProps {
  imageUrl?: string,
  alt?: string,
}

export default function GetImageUI({ imageUrl, alt = 'image' }: GetImageUiProps) {
  return (
    <>
      {imageUrl == undefined ?
        <div className="relative w-2/4 h-2/4">
          <Image src={'/resources/icons/features/default.svg'} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={alt}/>
        </div>
        :
        <Image src={imageUrl} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={alt}/>
      }
    </>
  )
}