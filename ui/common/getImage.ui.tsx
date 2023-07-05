import Image from "next/image";

interface GetImageUiProps {
  imageUrl?: string,
  alt?: string,
}

export default function GetImageUI({ imageUrl, alt = 'imagen' }: GetImageUiProps) {
  return (
    <>
      {imageUrl == undefined ?
        <div className="relative w-2/4 h-2/4">
          <Image src={'/resources/icons/features/default.svg'} fill alt={alt} />
        </div>
        :
        <Image src={imageUrl} fill alt={alt} />
      }
    </>
  )
}