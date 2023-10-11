import AGButton from "../common/ag-button.component";
import { BsArrowRight } from 'react-icons/bs';
import { CiEdit, CiSaveUp2 } from 'react-icons/ci';
import { FeatureInterface } from "../../interfaces/api.interface";
import { BasicData, ColorConfig, FeatureBasic } from "../../interfaces/common.interface";
import MobileOptionSelectorComponent from "./selectors/mobile/optionSelector.component";
import MobileFeatureSelectorComponent from "./selectors/mobile/featureSelector.component";
import MobileColorSelectorComponent from "./selectors/mobile/colorSelector.component";
import { useEffect, useState } from "react";
import Image from 'next/image';
import FeatureSelector from "./selectors/featureSelector.component";
import OptionSelectorUI from "./selectors/optionSelector.ui";
import ColorSelector from "./selectors/colorSelector.component";
import HudFeatureTitle from "./common/hudTitle.component";
import { RemovedAcc } from "../../utils/common.util";

interface HudComponentProps {

  selectListCategory: FeatureBasic[];
  // selectListFeatures: FeatureBasic[];
  // selectListAccessories: FeatureBasic[];

  optionList: FeatureInterface[] | undefined;
  // featureList: FeatureInterface[] | undefined;
  // accessoryList: AccessoryInterface[] | undefined;

  selectedCategory: string;
  // selectedFeature: string;
  // selectedAcc: string;

  onOptionChange: (id: string, path: string, name: string) => void;
  // changeFeature: (id: string, path: string, name: string) => void;
  // changeAccessory: (id: string, path: string, name: string) => void;

  onCategoryTypeChange: (value: string) => void;
  // onFeatureTypeChange: (value: string) => void;
  // onAccessoryTypeChange: (value: string) => void;

  selectedOption: BasicData | undefined;

  campaignSkinColorConfig: ColorConfig;
  skinColor: string;
  onSkinColorChange: (value: string) => void;

  editModeSelected: boolean;
  changeView: () => void;
  exportModel: () => void;
}

export default function HudComponent({
  selectListCategory,
  optionList,
  selectedCategory,
  onOptionChange,
  onCategoryTypeChange,
  selectedOption,
  campaignSkinColorConfig,
  skinColor,
  onSkinColorChange,
  editModeSelected,
  changeView,
  exportModel
}: HudComponentProps) {
  const [selectorOption, setSelectorOption] = useState<number>(1);

  const [isWindowGreaterThan1536, setIsWindowGreaterThan1536] = useState(false);

  // * This function allows us to know if the page has a width greater than 1536px.
  useEffect(() => {
    const handleResize = () => {
      setIsWindowGreaterThan1536(window.innerWidth > 1536);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // * Verify the initial screen size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
                  <MobileOptionSelectorComponent list={optionList}
                    activeOption={selectedOption}
                    handleClick={(id: string, path: string, name: string) => onOptionChange(id, path, name)} />
                </>
              }
              {/* {
                selectorOption == 2 &&
                <>
                <MobileOptionSelectorComponent list={accessoryList}
                  activeOption={selectedOption}
                  handleClick={(id: string, path: string, name: string) => changeAccessory(id, path, name)} />
                  <div>holis</div>
                  </>
              } */}
            </div>
            {/* FEATURES SELECTOR */}
            <div className="w-full bg-slate-100 flex">
              <div className="w-[calc(100%_-_60px)]">
                {selectorOption == 1 &&
                  <MobileFeatureSelectorComponent
                    list={selectListCategory}
                    activeOpc={selectedCategory}
                    handleClick={(value: string) => onCategoryTypeChange(value)}
                  />
                }
                {/* {
                  selectorOption == 2 &&
                  <MobileFeatureSelectorComponent
                    list={selectListAccessories}
                    activeOpc={selectedAcc}
                    handleClick={(value: string) => onAccessoryTypeChange(value)}
                  />
                } */}
                {
                  selectorOption == 2 &&
                  <MobileColorSelectorComponent list={['F6C89B', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                    activeColor={skinColor}
                    handleClick={(value: string) => void onSkinColorChange(value)} />
                }
              </div>
              <div className="w-[60px] pt-3 cursor-pointer" onClick={() => setSelectorOption(selectorOption >= 2 ? 1 : selectorOption + 1)}>
                <div className="border-l border-slate-400 text-center flex flex-col items-center">
                  <div className={"rounded-md w-[40px] h-[40px] flex justify-center items-center"}>
                    {/* {selectorOption == 1 &&
                      <Image
                        src='/resources/icons/buttons/accessories.svg'
                        width={30}
                        height={30}
                        alt={'Color button'}
                        className='opacity-70'
                      />
                    } */}
                    {selectorOption == 1 &&
                      <Image
                        src='/resources/icons/buttons/head.svg'
                        width={30}
                        height={30}
                        alt={'Color button'}
                        className='opacity-70'
                      />
                    }
                    {selectorOption == 2 &&
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
                    {/* {selectorOption == 1 && 'Accessor.'} */}
                    {selectorOption == 1 && 'Skin'}
                    {selectorOption == 2 && 'Features'}
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
      <div className={`fixed inset-0 ${editModeSelected ? 'w-[58%]' : 'w-0'} overflow-hidden h-screen bg-bg hidden xl:block transition-all duration-300`}>
        {/* CAMPAIGN HEADER SIGN */}
        <div className="fixed flex right-0 top-0 justify-center items-center gap-1 py-3 px-8 max-w-lg">
          <div className="-z-10 absolute -left-10 h-full w-[180%] skew-x-[45deg] bg-bg" />
          <Image
            priority
            src={'/resources/images/the-hub-logo-web.svg'}
            width={0}
            height={0}
            style={{
              width: 'auto',
              height: 'auto',
              maxHeight: '150px',
              maxWidth: '480px',
              minWidth: '200px'
            }}
            alt="Campaign icon"
          />
        </div>
        {/* WRAPPER */}
        <div className={`w-full h-full grid grid-cols-[148px_minmax(100px,_1fr)] ${editModeSelected ? 'opacity-100 delay-500 duration-500' : 'opacity-0 duration-200'} transition-all`}>
          {/* FEATURES SECTION */}
          <div className="h-screen">
            <FeatureSelector
              list={selectListCategory}
              activeOpc={selectedCategory}
              onCategoryChange={(value: string) => onCategoryTypeChange(value)}
            />
          </div>
          {/* EDIT SECTION */}
          <div className="flex flex-col justify-between w-full px-8">
            {/* TITLE SECTION */}
            <div className="text-gray-normal pt-10 2xl:pt-0">
              <div className="fixed right-0 bottom-0 flex justify-end pb-6 pt-12 2xl:static">
                <AGButton onClickEvent={() => changeView()} nm={isWindowGreaterThan1536}>
                  <p className="font-poppins text-center w-[240px] py-2">SAVE</p>
                </AGButton>
              </div>
              <div className="w-full">
                <h1 className="font-poppins text-lg">CUSTOMIZATION</h1>
                <HudFeatureTitle selectedFeature={RemovedAcc(selectedCategory)} />
              </div>
            </div>
            {/* OPTION COLOR SECTION */}
            {/* TODO Add features or option color change behavior */}
            <div className="pt-4 invisible">
              <ColorSelector
                list={['F8B290', 'E8A36F', '9F5835', 'F2A47E', 'C67E42']}
                activeColor={skinColor}
                handleClick={(value: string) => void onSkinColorChange(value)}
                listStyle="Oval"
              />
            </div>
            {/* OPTION SECTION */}
            <div className="h-full pt-8">
              <OptionSelectorUI
                list={optionList}
                activeOption={selectedOption}
                handleClick={(id: string, path: string, name: string) => onOptionChange(id, path, name)}
              />
            </div>
            {/* SKIN COLOR SECTION */}
            <div className={`py-8 ${campaignSkinColorConfig.usePalette ? '' : 'invisible'}`}>
              <h2 className="font-poppins pb-2">SKIN COLOR</h2>
              <ColorSelector
                list={campaignSkinColorConfig.colorPalette}
                activeColor={skinColor}
                handleClick={(value: string) => void onSkinColorChange(value)}
              />
            </div>

          </div>
        </div>
      </div>
      {!editModeSelected && <div className="fixed pt-8 pl-8 w-fit h-fit hidden xl:flex">
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
      </div>}
    </>
  )
}