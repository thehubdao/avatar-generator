import { MouseEvent } from "react";

interface ColorOptionUIProps {
  list?: string[];
  activeColor: string | undefined;
  handleChangeColor: (color: string) => void;
}

export default function ColorOptionUI({ list, activeColor, handleChangeColor }: ColorOptionUIProps) {
  function selectFeature(e: MouseEvent, color: string) {
    e.preventDefault();
    handleChangeColor(color);
  }

  return list?.map((opt) => {
    return (
      <div
        className={'cursor-pointer rounded-md transition duration-200 ease-in-out w-[50px] h-[50px] flex items-center justify-center mx-3 ' + (activeColor == opt ? 'shadow-inset-medium' : 'shadow-flat-medium')}
        onClick={(event) => selectFeature(event, opt)}
        key={opt}
      >
        <div className='w-4/6 h-4/6 rounded-md' style={{ backgroundColor: ('#' + opt) }}></div>
      </div>
    )
  })
}