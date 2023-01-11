import AGButton from "../common/ag-button.component";
import {BsArrowRight} from 'react-icons/bs';
import {CiEdit, CiSaveUp2} from 'react-icons/ci';
import {AccessoryInterface, FeatureInterface} from "../../interfaces/api.interface";
import {BasicData} from "../../interfaces/common.interface";
import OptionSelectorComponent from "../selectors/optionSelector.component";
import FeatureSelectorComponent from "../selectors/featureSelector.component";
import ColorSelectorComponent from "../selectors/colorSelector.component";
import Image from "next/image";
import {useEffect, useState} from "react";

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
    console.log("color: ", skinColor)
    console.log("data: ", exportData)
    // console.log("selected feature: ", selectedFeature)
  }, [skinColor, exportData]);

  return (
    <div className="fixed">
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
              <OptionSelectorComponent list={featureList}
                activeOption={exportData.find(e => e.id === selectedFeature)}
                handleClick={(id: string, path: string, name: string) => changeFeature(id, path, name)} />
                </>
            }
            {
              selectorOption == 2 &&
              <OptionSelectorComponent list={accessoryList}
                activeOption={exportData.find(e => e.id === selectedAcc)}
                handleClick={(id: string, path: string, name: string) => changeFeature(id, path, name)} />
            }
          </div>
          {/* FEATURES SELECTOR */}
          <div className="w-full bg-slate-100 flex">
            <div className="w-[calc(100%_-_60px)]">
              {selectorOption == 1 &&
                <FeatureSelectorComponent
                  list={selectListFeatures}
                  activeOpc={selectedFeature}
                  handleClick={(value: string) => onCategoryChange(value)}
                />
              }
              {
                selectorOption == 2 &&
                <FeatureSelectorComponent
                  list={selectListAccessories}
                  activeOpc={selectedAcc}
                  handleClick={(value: string) => onAccessoryChange(value)}
                />
              }
              {
                selectorOption == 3 &&
                <ColorSelectorComponent list={['F6C89B', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                  activeColor={skinColor}
                  handleClick={(value: string) => void onClickChangeSkinColor(value)} />
              }
            </div>
            <div className="w-[60px] pt-3 cursor-pointer" onClick={() => setSelectorOption(selectorOption >= 3 ? 1:selectorOption + 1)}>
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
  )
}