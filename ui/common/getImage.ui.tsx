import Image from "next/image";
import { useState } from "react";
import Loader from "../lukso/common/loader.ui";

interface GetImageUiProps {
  imageUrl?: string,
  alt?: string,
}

export default function GetImageUI({ imageUrl, alt = 'image' }: GetImageUiProps) {
  const [shouldReveal, setReveal] = useState(false);
  return (
    <>
      <div className="relative w-2/4 h-2/4">
        <Loader />
      </div>
      {imageUrl !== undefined &&
        <Image
          src={imageUrl}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          className={`${shouldReveal ? 'opacity-100' : 'opacity-0'} object-cover transition-opacity duration-500`}
          onLoadingComplete={() => setReveal(true)}
        />
      }
    </>
  )
}