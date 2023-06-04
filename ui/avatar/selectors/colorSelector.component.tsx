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

function ColorOption({ option, isActive, listStyle = 'Rectangular' }: ColorOptionProps) {

  const [activeStyle, setActiveStyle] = useState<string>('')
  const [optionStyle, setOptionStyle] = useState<string>('')
  useEffect(() => {
    if (listStyle === 'Oval') {
      // Oval Style on option buttons
      setOptionStyle('w-8 h-8 shadow-flat-medium rounded-full p-[.4rem]')
    } else {
      // Rectangle Style on option buttons
      setOptionStyle('w-12 h-12 p-2 shadow-flat-medium rounded-lg')
    }
  }, [listStyle])

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

export default function ColorSelector({ list, activeColor, handleClick, listStyle = 'Rectangular' }: ColorSelectorProps) {
  const selectFeature = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    handleClick(color);
  }

  const [barStyle, setBarStyle] = useState<string>('')
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