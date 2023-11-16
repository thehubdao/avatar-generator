import { FeatureBasic } from "../../../../interfaces/common.interface";

interface FeatureOptionCardUIProps {
  feature: FeatureBasic;
  activeOpc: boolean;
}

export default function FeatureOptionCardUI({ feature, activeOpc }: FeatureOptionCardUIProps) {

  return (
    <p className={'text-xs text-center p-2 opacity-50 truncate' + (activeOpc ? ' opacity-90 text-slate-700 border-b-[1px] border-slate-700' : '')}>
      {feature.displayName.toUpperCase()}
    </p>
  )
}