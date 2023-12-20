import { useState } from "react";
import AGButton from "../../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";
import { ColorConfig } from "../../../../../interfaces/common.interface";
import { DEFAULT_SKIN_PALETTE } from "../../../../../constants/colorPalettes.constant";

interface ColorPickerProps {
  materialName: string;
  color: string;
  id: string;
  usePalette: boolean;
  colorList?: string[];
  updateColorConfig: (colorConfig: ColorConfig) => Promise<void>;
}

export default function ColorConfigUI({ materialName, color, id, usePalette, colorList, updateColorConfig }: ColorPickerProps) {
  const maxColorsLength = 10;

  const [defaultMaterialName, setDefaultMaterialName] = useState<string>(materialName);
  const [defaultColor, setDefaultColor] = useState<string>(color);
  const [hasPaletteSelector, setHasPaletteSelector] = useState<boolean>(usePalette);
  const [paletteLength, setPaletteLength] = useState<number>(colorList?.length || maxColorsLength);
  const [paletteColors, setPaletteColors] = useState<string[]>(colorList || [...DEFAULT_SKIN_PALETTE]);
  const [defaultPaletteColor, setDefaultPaletteColor] = useState<number>(paletteColors.indexOf(defaultColor));

  const changePalette = (value = paletteLength) => {
    let newArray = [...paletteColors];
    if (newArray.length > value) {
      newArray = newArray.slice(0, value);
    } else if (newArray.length < value) {
      const newItemsLength = value - newArray.length;
      for (let index = 0; index < newItemsLength; index++) {
        newArray.push('FF0000');
      }
    }
    setPaletteColors(newArray);
  }

  const sendNewColorConfig = async () => {
    const newColorConfig = {
      materialName: defaultMaterialName,
      defColor: hasPaletteSelector ? paletteColors[defaultPaletteColor] : defaultColor,
      colorPalette: hasPaletteSelector ? paletteColors : [],
      usePalette: hasPaletteSelector,
    }
    await updateColorConfig(newColorConfig)
  }

  function onChangePaletteLength(value: number) {
    let newLength = value;
    if (value == undefined || value < 1) newLength = 1;
    if (value > maxColorsLength) newLength = maxColorsLength;

    changePalette(newLength);
    setPaletteLength(newLength);
    setDefaultPaletteColor(0);
  }

  return (
    <>
      <div className="my-2 px-2">
        <p className="font-poppins font-medium text-purple pb-2 mt-6">Material:</p>
        <input type="text" className="shadow-inset-soft hover:shadow-inset-medium px-4 py-2 min-h-[48px] w-full rounded-lg bg-bg"
          defaultValue={defaultMaterialName}
          onChange={e => {
            setDefaultMaterialName(e.currentTarget.value);
          }} />
        {
          defaultMaterialName.length > 0 ?
            <>
              <div className="pt-3 pb-4 flex gap-2">
                <label htmlFor={id + '-colorselector'} className="relative w-6 h-6 shadow-inset-soft bg-bg rounded-lg flex justify-center items-center cursor-pointer">
                  <div className={`w-3 h-3 bg-purple rounded-full ${hasPaletteSelector ? '' : 'hidden'}`}></div>
                  <p className="absolute left-[120%] whitespace-nowrap select-none">with specific palette</p>
                </label>
                <input
                  type="checkbox"
                  id={id + '-colorselector'}
                  checked={hasPaletteSelector}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    const newDefaultPaletteColor = isChecked ? 0 : paletteColors.indexOf(defaultColor);
                    setDefaultPaletteColor(newDefaultPaletteColor);
                    setHasPaletteSelector(isChecked);
                  }}
                  className="absolute hidden"
                />
              </div>
              {
                hasPaletteSelector ?
                  <div>
                    {/* default palette color section */}
                    <div>
                      <p className="font-poppins font-medium text-purple">Default color:</p>
                      <div className="flex items-center gap-2">
                        <div className="relative w-[100px] cursor-pointer">
                          <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                            <MdKeyboardArrowDown />
                          </div>
                          <select name="" id=""
                            value={defaultPaletteColor}
                            onChange={e => setDefaultPaletteColor(parseInt(e.target.value))}
                            className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" >
                            {paletteColors.map((el, index) => {
                              return (
                                <option key={index} value={index} className="relative bg-bg py-2 px-4 h-12">
                                  {index + 1}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div className="relative rounded-lg overflow-hidden w-full h-12 my-2 ml-2">
                          <input type="color" name="" value={`#${paletteColors[defaultPaletteColor]}`}
                            className="absolute -top-2 -left-2 w-[130%] h-[130%] cursor-pointer"
                            alt="change default palett color"
                            onChange={e => {
                              const arr = [...paletteColors];
                              arr[defaultPaletteColor] = e.target.value.substring(1);
                              setPaletteColors(arr);
                            }}
                          />
                          <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
                            <p className="text-xs">{`${paletteColors[defaultPaletteColor].toUpperCase()}`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* set the number of colors */}
                    <div>
                      <p className="font-poppins font-medium text-purple mt-2">Colors number:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="shadow-inset-soft hover:shadow-inset-medium px-4 py-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
                          value={paletteLength}
                          onChange={e => onChangePaletteLength(e.currentTarget.valueAsNumber)}
                        />
                      </div>
                    </div>
                    {/* palette */}
                    <div>
                      <p className="font-poppins font-medium text-purple pb-2 mt-2">Palette:</p>
                      <div className="grid grid-cols-5 gap-2">
                        {
                          paletteColors.map((color, index) => {
                            return (
                              <div key={index} className="relative w-9 h-9 overflow-hidden rounded-full">
                                <input type="color" name="" id={`${id}-color-${index}`} value={`#${color}`}
                                  className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 w-12 h-12 cursor-pointer"
                                  onChange={e => {
                                    const arr = [...paletteColors];
                                    arr[index] = e.target.value.substring(1);
                                    setPaletteColors(arr);
                                  }}
                                />
                                <div className="absolute bg-bg w-4 h-4 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 flex justify-center items-center pointer-events-none">
                                  <p className="font-normal text-xs">{index + 1}</p>
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div>
                  :
                  <div>
                    <p className="font-poppins font-medium text-purple pb-2">Default color:</p>
                    <div className="relative rounded-full overflow-hidden w-full h-12">
                      <input type="color" name="" id={id + '-picker'} value={`#${defaultColor}`} className="absolute -top-2 -left-2 w-[130%] h-[130%]"
                        onChange={e => { setDefaultColor(e.target.value.substring(1)) }} />
                      <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
                        <p className="text-xs">{defaultColor}</p>
                      </div>
                    </div>
                  </div>
              }
              <div className="pt-4">
                <AGButton nm full onClickEvent={() => sendNewColorConfig()}>
                  <p className="py-2">Update</p>
                </AGButton>
              </div>
            </>
            : <p className="text-xs pt-1 max-w-[252px]"> <span className="font-bold text-purple">*</span>Define a material name to start!, remember that the name must be the same material name on <span className="font-bold text-purple">Avatar Base (AB)</span></p>
        }
      </div>
    </>
  )
}