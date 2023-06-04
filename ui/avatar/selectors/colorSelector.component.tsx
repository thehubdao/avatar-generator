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
 * @params the same as the parent component
 * @param isActive A boolean value indicating whether the option is currently selected.
 */

function ColorOption({ option, isActive, listStyle = 'Rectangular' }: ColorOptionProps) {

  // * Variables controlling the style of the selection buttons
  const [activeStyle, setActiveStyle] = useState<string>('')
  const [optionStyle, setOptionStyle] = useState<string>('')

  //* List style control
  useEffect(() => {
    if (listStyle === 'Oval') {
      setOptionStyle('w-8 h-8 shadow-flat-medium rounded-full p-[.4rem]')
    } else {
      setOptionStyle('w-12 h-12 p-2 shadow-flat-medium rounded-lg')
    }
  }, [listStyle])

  // * Is active style control
  useEffect(() => {
    const rectangleStyle = (listStyle === 'Rectangular') ? 'p-4' : ''
    isActive
      ? setActiveStyle(`shadow-inset-medium ${rectangleStyle}`)
      : setActiveStyle('')
  }, [isActive])

  return (
    <div className={`${optionStyle} ${activeStyle}`} >
      <div className={`w-full h-full ${listStyle === 'Oval' ? 'rounded-full' : ''} ${isActive ? 'rounded-full' : ''}`} style={{ backgroundColor: (`#${option}`) }}></div>
    </div>
  )
}

/**
 * @param list An array of colors in hexadecimal format without the '#' symbol, e.g., ['FF0000'].
 * @param activeColor 
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
        list ?
          list.map(opt => {
            return (
              <div key={opt} className={`cursor-pointer`} onClick={event => selectFeature(event, opt)}>
                <ColorOption option={opt} isActive={activeColor && activeColor === opt ? true : false} listStyle={listStyle} />
              </div>
            )
          })
          :
          <p>no Color list</p>
      }
    </div>
  )
}