import { useEffect, useState } from "react";

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

/** 
 * @params the same as the parent component.
 * @param isActive A boolean value indicating whether the option is currently selected.
 */

function ColorOption({ option, isActive, listStyle = 'Rectangular' }: ColorOptionProps) {

  // * Variables controlling the style of the selection buttons
  const [optionStyle, setOptionStyle] = useState<string>('')

  //* List style control
  useEffect(() => {
    if (listStyle === 'Oval') {
      setOptionStyle(`w-8 h-8 shadow-${isActive ? 'inset-medium' : 'flat-medium'} rounded-full p-${isActive ? '2' : '1'}`)
    } else {
      setOptionStyle(`w-12 h-12 p-${isActive ? '4' : '2'} shadow-${isActive ? 'inset-medium' : 'flat-medium'} rounded-lg`)
    }
  }, [listStyle, isActive])

  return (
    <div className={`${optionStyle} transition-all duration-150 ease-in-out`} >
      <div className={`w-full h-full ${listStyle === 'Oval' ? 'rounded-full' : ''} ${isActive ? 'rounded-full' : ''}`} style={{ backgroundColor: (`#${option}`) }} />
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
  const selectFeature = (e: React.MouseEvent, color: string) => {
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
                <ColorOption option={opt} isActive={activeColor && activeColor === opt ? true : false} listStyle={listStyle} />
              </div>
            )
          })
          : <p>no Color list</p>
      }
    </div>
  )
}