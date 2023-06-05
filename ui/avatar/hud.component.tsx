import AGButton from "../common/ag-button.component";
import { BsArrowRight } from 'react-icons/bs';
import { CiEdit, CiSaveUp2 } from 'react-icons/ci';
import { AccessoryInterface, FeatureInterface } from "../../interfaces/api.interface";
import { BasicData } from "../../interfaces/common.interface";
import MobileOptionSelectorComponent from "./selectors/mobile/optionSelector.component";
import MobileFeatureSelectorComponent from "./selectors/mobile/featureSelector.component";
import MobileColorSelectorComponent from "./selectors/mobile/colorSelector.component";
import { useEffect, useState } from "react";
import Image from 'next/image';
import FeatureSelector from "./selectors/featureSelector.component";
import OptionSelector from "./selectors/optionSelector.component";
import ColorSelector from "./selectors/colorSelector.component";

interface Props {
  editModeSelected: boolean;
  selectListFeatures: BasicData[],
  featureList: FeatureInterface[] | undefined;
  selectedFeature: string;
  selectListAccessories: BasicData[];
  accessoryList: AccessoryInterface[] | undefined;
  selectedAcc: string;
  skinColor: string;
  exportData: BasicData[];
  changeView: () => void;
  changeFeature: (id: string, path: string, name: string) => void;
  onCategoryChange: (value: string) => void;
  onAccessoryChange: (value: string) => void;
  onClickChangeSkinColor: (value: string) => void;
  exportModel: () => void;
}



export default function HudComponent({ editModeSelected,
  selectListFeatures,
  featureList,
  selectedFeature,
  selectListAccessories,
  accessoryList,
  selectedAcc,
  skinColor,
  exportData,
  changeView,
  changeFeature,
  onCategoryChange,
  onAccessoryChange,
  onClickChangeSkinColor,
  exportModel
}: Props) {
  const [selectorOption, setSelectorOption] = useState<number>(1);

  useEffect(() => {
    // console.log("color: ", skinColor)
    // console.log("data: ", exportData)
    // console.log("selected feature: ", selectedFeature)
  }, [skinColor, exportData]);

  return (
    <>
      {/* MOBILE UI */}
      <div className="fixed xl:hidden">
        <div onClick={() => changeView()}>
          {editModeSelected ?
            <AGButton>
              <div className="flex items-center justify-between">
                <BsArrowRight />
                <p className="text-sm">NEXT</p>
              </div>
            </AGButton>
            :
            <AGButton>
              <div className="flex items-center justify-between">
                <CiEdit />
                <p className="text-sm">EDIT</p>
              </div>
            </AGButton>
          }
        </div>
        {editModeSelected ?
          <div className="fixed bottom-0 left-0 w-screen">
            {/* OPTION SELECTOR */}
            <div className="w-full">
              {
                selectorOption == 1 &&
                <>
                  <MobileOptionSelectorComponent list={featureList}
                    activeOption={exportData.find(e => e.id === selectedFeature)}
                    handleClick={(id: string, path: string, name: string) => changeFeature(id, path, name)} />
                </>
              }
              {
                selectorOption == 2 &&
                <MobileOptionSelectorComponent list={accessoryList}
                  activeOption={exportData.find(e => e.id === selectedAcc)}
                  handleClick={(id: string, path: string, name: string) => changeFeature(id, path, name)} />
              }
            </div>
            {/* FEATURES SELECTOR */}
            <div className="w-full bg-slate-100 flex">
              <div className="w-[calc(100%_-_60px)]">
                {selectorOption == 1 &&
                  <MobileFeatureSelectorComponent
                    list={selectListFeatures}
                    activeOpc={selectedFeature}
                    handleClick={(value: string) => onCategoryChange(value)}
                  />
                }
                {
                  selectorOption == 2 &&
                  <MobileFeatureSelectorComponent
                    list={selectListAccessories}
                    activeOpc={selectedAcc}
                    handleClick={(value: string) => onAccessoryChange(value)}
                  />
                }
                {
                  selectorOption == 3 &&
                  <MobileColorSelectorComponent list={['F6C89B', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                    activeColor={skinColor}
                    handleClick={(value: string) => void onClickChangeSkinColor(value)} />
                }
              </div>
              <div className="w-[60px] pt-3 cursor-pointer" onClick={() => setSelectorOption(selectorOption >= 3 ? 1 : selectorOption + 1)}>
                <div className="border-l border-slate-400 text-center flex flex-col items-center">
                  <div className={"rounded-md w-[40px] h-[40px] flex justify-center items-center"}>
                    {selectorOption == 1 &&
                      <Image
                        src='/resources/icons/buttons/accessories.svg'
                        width={30}
                        height={30}
                        alt={'Color button'}
                        className='opacity-70'
                      />
                    }
                    {selectorOption == 2 &&
                      <Image
                        src='/resources/icons/buttons/head.svg'
                        width={30}
                        height={30}
                        alt={'Color button'}
                        className='opacity-70'
                      />
                    }
                    {selectorOption == 3 &&
                      <Image
                        src='/resources/icons/buttons/features.svg'
                        width={30}
                        height={30}
                        alt={'Color button'}
                        className='opacity-70'
                      />
                    }
                  </div>
                  <p className='text-[10px] pt-1 opacity-50 w-[40px]'>
                    {selectorOption == 1 && 'Accessor.'}
                    {selectorOption == 2 && 'Skin'}
                    {selectorOption == 3 && 'Features'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          :
          <AGButton>
            <div className="flex items-center justify-between" onClick={() => exportModel()}>
              <CiSaveUp2 />
              <p className="text-sm">SAVE</p>
            </div>
          </AGButton>
        }
      </div>
      {/* DESKTOP UI */}
      {
        editModeSelected ?
          <div className="fixed inset-0 w-[58%] h-screen bg-bg hidden xl:block">
            {/* CAMPAIGN HEADER SIGN */}
            <div className="fixed flex right-0 top-0 justify-center items-center gap-1 py-3 px-8 max-w-lg">
              <div className="-z-10 absolute -right-10 h-full w-[120%] skew-x-[45deg] bg-bg" />
              <div className="w-10">
                <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M488.965 246.055C488.965 246.055 431.971 203.262 420.619 182.483C409.267 161.705 402.515 88.5168 402.515 88.5168C337.294 -29.5056 174.507 -29.5056 109.551 88.5168C109.551 88.5168 102.799 161.705 91.4474 182.483C80.0957 203.262 22.8651 246.055 22.8651 246.055C-42.0905 364.325 39.0524 512 169.229 512C169.229 512 232.976 482.378 255.945 482.378C278.914 482.378 342.66 512 342.66 512C472.837 512 554.245 364.325 489.024 246.055H488.965ZM255.886 422.331C182.232 422.331 122.554 359.78 122.554 282.51C122.554 205.241 182.202 142.689 255.886 142.689C329.569 142.689 389.217 205.241 389.217 282.51C389.217 359.78 329.569 422.331 255.886 422.331Z" fill="#19BCF3" />
                </svg>
              </div>
              <p className="font-black text-3xl">
                {'Este es un texto de doble linea'?.toUpperCase()}
                <span className="text-[#19BCF3]">.</span>
              </p>
            </div>
            {/* WRAPPER */}
            <div className="w-full h-full flex">
              {/* FEATURES SECTION */}
              <div className="h-screen p-8">
                <FeatureSelector
                  list={[...selectListFeatures, ...selectListAccessories]}
                  activeOpc={selectedFeature}
                  handleClick={(value: string) => onCategoryChange(value)}
                />
              </div>
              {/* EDIT SECTION */}
              <div className="flex flex-col justify-between w-full px-8">
                {/* TITLE SECTION */}
                <div className="text-gray-normal">
                  <div className="flex justify-end pb-6 pt-12">
                    <AGButton nm onClickEvent={() => changeView()}>
                      <p className="font-poppins text-center w-[240px] py-2">SAVE</p>
                    </AGButton>
                  </div>
                  <div>
                    <h1 className="font-poppins text-lg">CUSTOMIZATION</h1>
                    <h2 className="font-work font-bold text-6xl uppercase">{selectedFeature}</h2>
                  </div>
                </div>
                {/* SKIN COLOR SECTION */}
                <div className="pt-4">
                  <ColorSelector
                    list={['F8B290', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                    activeColor={skinColor}
                    handleClick={(value: string) => void onClickChangeSkinColor(value)}
                  />
                </div>
                {/* OPTION SECTION */}
                <div className="h-full pt-8">
                  <OptionSelector
                    list={featureList}
                    activeOption={exportData.find(e => e.id === selectedFeature)}
                    handleClick={(id: string, path: string, name: string) => changeFeature(id, path, name)}
                  />
                </div>
                {/* SKIN COLOR SECTION */}
                <div className="py-8">
                  <h2 className="font-poppins pb-2">SKIN COLOR</h2>
                  <ColorSelector
                    list={['F8B290', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                    activeColor={skinColor}
                    handleClick={(value: string) => void onClickChangeSkinColor(value)}
                  />
                </div>
              </div>
            </div>
          </div>
          :
          <div className="fixed pt-8 pl-8 w-fit h-fit flex">
            <AGButton onClickEvent={() => changeView()}>
              <div className="flex items-center justify-between">
                <p className="font-poppins text-center w-[120px] py-2">EDIT</p>
              </div>
            </AGButton>
            <AGButton onClickEvent={() => exportModel()}>
              <div className="flex items-center justify-between">
                <p className="font-poppins text-center w-[120px] py-2">EXPORT</p>
              </div>
            </AGButton>
          </div>
      }
    </>
  )
}