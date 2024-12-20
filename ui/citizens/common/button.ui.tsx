import { ReactElement } from "react";
import ArrowLinkSVG from "./SVG/arrowLinkSVG.ui";

interface ButtonProps {
  label?: string;
  className?: string;
  textStyles?: string;
  iconStyles?: string;
  light?: boolean;
  withIcon?: boolean;
  children?: ReactElement;
  handleClick: () => void;
}

export default function Button({ label = 'Button', className, textStyles, iconStyles, light = false, withIcon = false, children, handleClick }: ButtonProps) {
  return (
    <button className={`flex justify-between items-center gap-2  ${light ? 'bg-white/75 border-2 border-white rounded-2xl px-4 py-[10px]':'min-w-[214px] bg-citizens-dark rounded-[20px] p-2 shadow-citizens-btn'} ${className}`} onClick={() => handleClick()}>
      <p className={`whitespace-nowrap ${light ? 'text-xl':'font-light text-lg text-white text-center uppercase grow'} ${textStyles}`}>{label}</p>
      {
        withIcon &&
        <div className={`${light ? '':'w-10 h-[27px] border border-white rounded-full flex justify-center items-center'} ${iconStyles}`}>
          {children ?? <ArrowLinkSVG />}
        </div>
      }
    </button>
  )
}