import { MouseEvent, useEffect, useState } from "react";

interface ColorSelectorProps {
  list?: string[];
  activeColor?: string;
  handleClick: (color: string) => void;
  listStyle?: 'Oval' | 'Rectangular'
}

interface ColorOptionProps {
  option: string;
  isActive: boolean;
  listStyle?: 'Oval' | 'Rectangular'
}

interface ColorOptionState {
  width: string;
  height: string;
  rounded: string;
  padding: string;
}

/** 
 * @params the same as the parent component.
 * @param isActive A boolean value indicating whether the option is currently selected.
 */

function ColorOption({ option, isActive, listStyle = 'Rectangular' }: ColorOptionProps) {

  // * Variables controlling the style of the selection buttons
  const [styleControl, setStyleControl] = useState<ColorOptionState>({ ...getOptionType() })

  function getOptionType() {
    switch (listStyle) {
      case 'Oval':
        return {
          width: 'w-8',
          height: 'h-8',
          rounded: 'rounded-full',
          padding: isActive ? 'p-2' : 'p-[.4rem]'
        }
      default: // Rectangle
        return {
          width: 'w-12',
          height: 'h-12',
          rounded: 'rounded-lg',
          padding: isActive ? 'p-4' : 'p-2'
        }
    }
  }

  //* List style control
  useEffect(() => {
    setStyleControl({ ...getOptionType() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStyle, isActive])

  return (
    <div className={`${styleControl.width} ${styleControl.height} ${styleControl.rounded} ${styleControl.padding} ${isActive ? 'shadow-inset-medium' : 'shadow-flat-soft hover:shadow-flat-hard'} transition-all duration-150 ease-in-out`} >
      <div className={`w-full h-full ${listStyle === 'Oval' || isActive ? 'rounded-full' : ''}`} style={{ backgroundColor: (`#${option}`) }} />
    </div>
  )
}

/**
 * @param list An array of colors in hexadecimal format without the '#' symbol, e.g., ['FF0000'].
 * @param activeColor hexadecimal string with the selected color.
 * @param handleClick The function enables us to select the color for a specific feature.
 * @param listStyle It allows us to choose between oval and rectangular styles from the color picker list.
 * 
 * @return color selector component
 */

export default function ColorSelector({ list, activeColor, handleClick, listStyle = 'Rectangular' }: ColorSelectorProps) {
  const selectFeature = (e: MouseEvent<HTMLDivElement>, color: string) => {
    e.preventDefault();
    handleClick(color);
  }

  const [barStyle, setBarStyle] = useState<string>('')
  // * List Style bar controller
  useEffect(() => {
    if (listStyle === 'Oval') {
      setBarStyle('shadow-inset-medium rounded-full px-4 py-2 w-fit')
    } else setBarStyle('')
  }, [listStyle])

  return (
    <div className={`flex gap-3 ${barStyle}`}>
      {
        list
          ? list.map(opt => {
            return (
              <div key={opt} className={`cursor-pointer`} onClick={event => selectFeature(event, opt)}>
                <ColorOption option={opt} isActive={activeColor === opt} listStyle={listStyle} />
              </div>
            )
          })
          : <p>no Color list</p>
      }
    </div>
  )
}