import { IoChevronForwardSharp } from "react-icons/io5";
import { Breadcrumb, PageLocation } from "../../../../enums/common.enum";
import Link from "next/link";

const BREADCRUMB_LINKS: Record<Breadcrumb, PageLocation> = {
  [Breadcrumb.Login]: PageLocation.Login,
  [Breadcrumb.FirstSteps]: PageLocation.FirstSteps,
  [Breadcrumb.AdminCampaign]: PageLocation.AdminCampaign,
  [Breadcrumb.AssetCreate]: PageLocation.AssetCreate,
  [Breadcrumb.Account]: PageLocation.Account,
  [Breadcrumb.UserControl]: PageLocation.UserControl,
  [Breadcrumb.Missing]: PageLocation.Admin,
};

const BREADCRUMB_TITLES: Record<Breadcrumb, string> = {
  [Breadcrumb.Login]: 'Login',
  [Breadcrumb.FirstSteps]: 'Create Campaign',
  [Breadcrumb.AdminCampaign]: 'Campaign Configuration',
  [Breadcrumb.AssetCreate]: 'Create Asset',
  [Breadcrumb.Account]: 'Account',
  [Breadcrumb.UserControl]: 'User Control',
  [Breadcrumb.Missing]: 'Missing Crumb',
};

interface BreadcrumbsProps {
  paths: Breadcrumb[];
}

export default function BreadcrumbsUI({ paths }: BreadcrumbsProps) {

  return (
    <div className="flex gap-2">
      {
        paths.map((path, index) => {
          return (
            <div key={index} className="flex gap-2 items-center">
              <div>
                <IoChevronForwardSharp />
              </div>
              {
                index === paths.length - 1 ?
                  <p>
                    {BREADCRUMB_TITLES[path]}
                  </p>
                  :
                  <Link className={'hover:underline'} href={BREADCRUMB_LINKS[path]}>
                    {BREADCRUMB_TITLES[path]}
                  </Link>
              }
            </div>
          )
        })
      }
    </div>
  )
}