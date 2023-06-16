import { useEffect, useState } from "react";
import AGButton from "../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";

interface ColorPickerProps {
  color: string,
  id: string,
  specificPalette: boolean,
  colorList?: string[]
}

const colorArr = [
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000',
  '#F00000',
  '#FF0000'
]

export default function ColorPicker({ color, id, specificPalette, colorList }: ColorPickerProps) {
  const [defaultColor, setDefaultColor] = useState<string>(color);
  const [paletteSelector, setPaletteSelector] = useState<boolean>(specificPalette);
  const [paletteLength, setPaletteLength] = useState<number>(colorList?.length || 0);
  const [paletteColors, setPaletteColors] = useState<string[]>(colorList || colorArr);
  const [defaultPaletteColor, setDefaultPaletteColor] = useState<string>('1');

  useEffect(() => {
    //* function to set default color on data base here
    // eslint-disable-next-line no-console
    console.log(id + ' default color: ', defaultColor);
  }, [id, defaultColor]);

  useEffect(() => {
    //* function to set paletteSelector on data base here
    // eslint-disable-next-line no-console
    console.log('with picker: ', paletteSelector);
  }, [paletteSelector]);

  useEffect(() => {
    //* function to set palette colors on data base here
    // eslint-disable-next-line no-console
    console.log('palette colors: ', paletteColors);
  }, [paletteColors]);

  useEffect(() => {
    //* function to set palette colors on data base here
    // eslint-disable-next-line no-console
    console.log('default palette color: ', defaultPaletteColor);
  }, [defaultPaletteColor]);

  const setNewPalette = () => {
    let newArray = [...paletteColors];
    if (newArray.length > paletteLength) {
      newArray = newArray.slice(0, paletteLength);
    } else if (newArray.length < paletteLength) {
      const newItemsLength = paletteLength - newArray.length;
      for (let index = 0; index < newItemsLength; index++) {
        newArray.push('#FF0000');
      }
    }
    setPaletteColors(newArray);
  }

  return (
    <>
      <div className="my-2">
        <div className="pt-3 pb-4 flex gap-2">
          <label htmlFor={id + '-colorselector'} className="relative w-6 h-6 shadow-inset-soft bg-bg rounded-lg flex justify-center items-center cursor-pointer">
            <div className={`w-3 h-3 bg-purple rounded-full ${paletteSelector ? '' : 'hidden'}`}></div>
            <p className="absolute left-[120%] whitespace-nowrap select-none">with specific palette</p>
          </label>
          <input type="checkbox" id={id + '-colorselector'} checked={paletteSelector} onChange={e => { setPaletteSelector(e.target.checked) }} className="absolute hidden" />
        </div>
        {
          paletteSelector ?
            <div>
              <div>
                <p className="font-poppins font-medium text-purple mt-2">Colors number:</p>
                <div className="flex items-center gap-2">
                  <input type="number" className="shadow-inset-soft hover:shadow-inset-medium px-4 py-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" min='5' max='20' defaultValue={paletteLength} onChange={e => {
                    setPaletteLength(parseInt(e.target.value));
                  }} />
                  <AGButton nm onClickEvent={() => {
                    setNewPalette();
                  }}>
                    <p className="py-2">Set</p>
                  </AGButton>
                </div>
              </div>
              <div>
                <p className="font-poppins font-medium text-purple mt-2">Default color:</p>
                <div className="flex items-center gap-2">
                  <div className="relative w-[80px] cursor-pointer">
                    <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                      <MdKeyboardArrowDown />
                    </div>
                    <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" onChange={e => setDefaultPaletteColor(e.target.value)}>
                      {
                        paletteColors.map((el, index) => {
                          return (
                            <option key={index + 1} value={index + 1} className="relative bg-bg py-2 px-4 h-12">
                              {index + 1}
                            </option>
                          )
                        })
                      }
                    </select>
                  </div>
                  <div className="w-20 h-12 m-2 rounded-lg" style={{ background: paletteColors[parseInt(defaultPaletteColor) - 1] }}></div>
                </div>
              </div>
              <p className="font-poppins font-medium text-purple pb-2 mt-2">Palette:</p>
              <div className="grid grid-cols-10 gap-2">
                {
                  paletteColors.map((color, index) => {
                    return (
                      <div key={index} className="relative w-7 h-7 overflow-hidden rounded-full">
                        <input type="color" name="" id={`${id}-color-${index}`} value={color} className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 w-12 h-12" onChange={e => {
                          const arr = [...paletteColors];
                          arr[index] = e.target.value;
                          setPaletteColors(arr);
                        }} />
                        <div className="absolute bg-bg w-4 h-4 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 flex justify-center items-center pointer-events-none">
                          <p className="font-normal text-xs">{index + 1}</p>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            :
            <div>
              <p className="font-poppins font-medium text-purple pb-2">Default color:</p>
              <div className="relative rounded-full overflow-hidden w-full h-12">
                <input type="color" name="" id={id + '-picker'} value={defaultColor} className="absolute -top-2 -left-2 w-[130%] h-[130%]" onChange={e => { setDefaultColor(e.target.value) }} />
                <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
                  <p className="text-xs">{defaultColor}</p>
                </div>
              </div>
            </div>
        }
      </div>
    </>
  )
}