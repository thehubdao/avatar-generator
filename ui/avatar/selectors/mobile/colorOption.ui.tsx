import { MouseEvent } from "react";

interface ColorOptionUIProps {
  color: string;
  activeColor: boolean;
  handleChangeColor: (color: string) => void;
}

export default function ColorOptionUI({ color, activeColor, handleChangeColor }: ColorOptionUIProps) {
  function selectFeature(e: MouseEvent) {
    e.preventDefault();
    handleChangeColor(color);
  }

  return (
    <div
      className={'cursor-pointer rounded-md transition duration-200 ease-in-out w-[50px] h-[50px] flex items-center justify-center mx-3 ' + (activeColor ? 'shadow-inset-medium' : 'shadow-flat-medium')}
      onClick={(event) => selectFeature(event)}
      key={color}
    >
      <div className='w-4/6 h-4/6 rounded-md' style={{ backgroundColor: ('#' + color) }}></div>
    </div>
  )
}