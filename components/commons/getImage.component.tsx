import { useEffect, useState } from "react";
import GetImageUI from "../../ui/common/getImage.ui";
import { GetFileUrl } from "../../utils/firebase.util";
import { Module } from "../../enums/common.enum";
import { LogError } from "../../utils/common.util";

interface GetImageProps {
  url?: string;
  alt?: string;
}

export default function GetImage({ url, alt }: GetImageProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const getData = async () => {
    const result = await GetFileUrl(url);
    if (!result.success)
      void LogError(Module.OptionSelector, `${result.errCode}: ${result.errMessage}`)

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