import { MouseEvent } from "react";

interface ColorItemUIProps {
  color: string;
  isActive: boolean;
  handleChangeColor: (color: string) => void;
}

export default function ColorItemUI({ color, isActive, handleChangeColor }: ColorItemUIProps) {
  function selectColor(e: MouseEvent) {
    e.preventDefault();
    handleChangeColor(color);
  }

  return (
    <div
      className={'cursor-pointer rounded-md transition duration-200 ease-in-out w-[50px] h-[50px] flex items-center justify-center mx-3 ' + (isActive ? 'shadow-inset-medium' : 'shadow-flat-medium')}
      onClick={(event) => selectColor(event)}
      key={color}
    >
      <div className='w-4/6 h-4/6 rounded-md' style={{ backgroundColor: ('#' + color) }}></div>
    </div>
  )
}