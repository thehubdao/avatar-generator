import Image from "next/image";

interface GetImageUiInterface {
  imageUrl?: string;
  alt?: string;
}

/**
 ** GetImageUI is a versatile component that displays images with fallback options.
 *
 * @param {string} imageUrl - The URL of the image to be displayed.
 * @param {string} alt The alternative text for the image. @default 'imagen'
 * 
 * @returns {TSX.Element} - The rendered GetImageUI component.
 */
export default function GetImageUI({ imageUrl, alt = 'imagen' }: GetImageUiInterface): JSX.Element {
  return (
    <>
      {imageUrl === undefined ? (
        // Render default image if no imageUrl is provided
        <div className="relative w-2/4 h-2/4">
          <Image src={'/resources/icons/features/default.svg'} fill alt={alt} />
        </div>
      ) : (
        // Render provided imageUrl as an Image component
        <Image src={imageUrl} fill alt={alt} />
      )}
    </>
  );
}
