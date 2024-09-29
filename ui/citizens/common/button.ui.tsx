import { ReactElement } from "react";
import ArrowLinkSVG from "./SVG/arrowLinkSVG.ui";

interface ButtonProps {
  label?: string;
  className?: string;
  textStiles?: string;
  light?: boolean;
  withIcon?: boolean;
  children?: ReactElement;
  handleClick: () => void;
}

export default function Button({ label = 'Button', className, textStiles, light = false, withIcon = false, children, handleClick }: ButtonProps) {
  return (
    <button className={`flex justify-between items-center gap-2  ${light ? 'bg-white/75 border-2 border-white rounded-2xl px-4 py-[10px]':'min-w-[214px] bg-citizens-dark rounded-[20px] p-2 shadow-citizens-btn'} ${className}`} onClick={() => handleClick()}>
      <p className={` ${light ? 'text-xl':'font-light text-lg text-white text-center uppercase grow'} ${textStiles}`}>{label}</p>
      {
        withIcon &&
        <div className={`${light ? '':'w-10 h-[27px] border border-white rounded-full flex justify-center items-center'}`}>
          {children ?? <ArrowLinkSVG />}
        </div>
      }
    </button>
  )
}