import { useEffect, useState } from "react";
import GetImageUI from "../../ui/common/getImage.ui";
import { GetFileUrl } from "../../utils/firebase.util";

interface GetImageProps {
  url?: string;
  alt?: string;
}

export default function GetImage({ url, alt }: GetImageProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const newImage = await GetFileUrl(url);
      setImageUrl(newImage ?? undefined);
    })().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    <GetImageUI imageUrl={imageUrl} alt={alt} />
  )
}