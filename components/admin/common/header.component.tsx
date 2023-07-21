import { useEffect, useState } from "react";
import { Breadcrumb, PageLocation } from "../../../enums/common.enum";
import HeaderUI from "../../../ui/admin/common/header/header.ui";
import { usePathname } from 'next/navigation';
import { AddOrRemoveSlash, GetKeyByValue } from "../../../utils/common.util";

export default function Header() {
  const pathname = usePathname();
  const [url, setUrl] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    if (pathname !== PageLocation.Admin) setUrl(generateBreadCrumbs(pathname));
    setUrl(generateBreadCrumbs(pathname));
  }, [pathname])

  const generateBreadCrumbs = (path: string) => {
    const newPath = path.split('/').filter(el => el !== AddOrRemoveSlash(PageLocation.Admin) && el !== '');
    return newPath.map(p => {
      const key = GetKeyByValue(p, Breadcrumb);
      return key == undefined ? Breadcrumb.Missing : Breadcrumb[key];
    });
  }

  return (
    <HeaderUI homeButton={url.length > 0} breadCrumbs={url} />
  )
}