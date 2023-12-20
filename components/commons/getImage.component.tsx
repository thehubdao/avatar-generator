import { useEffect, useState } from "react";
import GetImageUI from "../../ui/common/getImage.ui";
import { GetFileUrl } from "../../utils/firebase.util";

interface GetImageProps {
  url?: string;
  alt?: string;
}

// TODO: Check the nextJS Image component, maybe we can improve the expectated behavior with only that component
export default function GetImage({ url, alt }: GetImageProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const getData = async () => {
    const result = await GetFileUrl(url);
    setImageUrl(result.success ? result.value : undefined);
  }

  useEffect(() => {
    getData().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    <GetImageUI imageUrl={imageUrl} alt={alt} />
  )
}