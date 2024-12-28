import { FeatureBasic } from "../../../../interfaces/common.interface";

interface FeatureItemUIProps {
  feature: FeatureBasic;
  isActive: boolean;
}

export default function FeatureItemUI({ feature, isActive }: FeatureItemUIProps) {

  return (
    <p className={'text-xs text-center p-2 opacity-50 truncate dark:text-gray-light' + (isActive ? ' opacity-90 text-slate-700 dark:text-gray-extralight border-b-[1px] border-slate-700 dark:border-gray-extralight' : '')}>
      {feature.displayName.toUpperCase()}
    </p>
  )
}