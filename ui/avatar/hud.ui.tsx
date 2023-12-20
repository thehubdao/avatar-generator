import AGButton from "../common/ag-button.component";
import { FeatureInterface } from "../../interfaces/api.interface";
import { BasicData, ColorConfig, FeatureBasic } from "../../interfaces/common.interface";
import MobileOptionSelectorUI from "./selectors/mobile/optionSelector.ui";
import MobileFeatureSelectorUI from "./selectors/mobile/featureSelector.ui";
import MobileColorSelectorUI from "./selectors/mobile/colorSelector.ui";
import { useEffect, useState } from "react";
import Image from 'next/image';
import FeatureSelector from "./selectors/featureSelector.component";
import OptionSelectorUI from "./selectors/optionSelector.ui";
import ColorSelector from "./selectors/colorSelector.component";
import HudFeatureTitleUI from "./common/hudTitle.ui";
import { RemovedAcc } from "../../utils/common.util";
import ExportButtonUI from "./common/exportButton.ui";
import { ModelExtension } from "../../enums/export.enum";

interface HudUIProps {

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
  exportModel: (type: ModelExtension) => Promise<void>;
  isCustomCampaignHud?: boolean;
  exportAllow?: ModelExtension[];
}

export default function HudUI({
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
  exportModel,
  isCustomCampaignHud,
  exportAllow
}: HudUIProps) {
  const [isWindowGreaterThan1536, setIsWindowGreaterThan1536] = useState(false);
  const [shouldShowColorSelectorModal, setShouldShowColorSelectorModal] = useState<boolean>(false);

  //* todo, change this to redux to control screen size.
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
      <div className={`fixed flex w-full xl:hidden gap-5 px-10 text-xs font-semibold ${editModeSelected ? 'top-3 justify-around' : 'bottom-5 justify-center'}`}>
        {editModeSelected
          ? <>
            <AGButton full onClickEvent={() => changeView()}>
              <p>BACK</p>
            </AGButton>
            <AGButton full onClickEvent={() => changeView()}>
              <p>SAVE</p>
            </AGButton>
          </>
          : <>
            <AGButton full onClickEvent={() => changeView()}>
              <p>EDIT</p>
            </AGButton>
            <AGButton full onClickEvent={() => exportModel(ModelExtension.GLB)}>
              <p>EXPORT</p>
            </AGButton>
          </>
        }
        {
          <div className={`fixed bottom-0 left-0 w-screen bg-slate-100 ${editModeSelected ? 'h-64' : ' h-0'} transition-all duration-300`}>
            <div className="w-full">
              {/* FEATURES SELECTOR */}
              <div className="w-full">
                <MobileFeatureSelectorUI
                  list={selectListCategory}
                  activeOpc={selectedCategory}
                  handleClick={(value: string) => onCategoryTypeChange(value)}
                />
                <div className="flex text-gray-normal mx-4 items-center">
                  <HudFeatureTitleUI selectedFeature={RemovedAcc(selectedCategory)} size="small" />
                  <AGButton nm fit onClickEvent={() => setShouldShowColorSelectorModal(true)}>
                    <div className="w-full flex justify-center items-center gap-3 text-xs font-semibold">
                      <p>SKIN</p>
                      <div className="shadow-flat-soft h-7 w-7 rounded-sm p-1">
                        <div className="w-full h-full rounded-sm" style={{ backgroundColor: ('#' + skinColor) }} />
                      </div>
                    </div>
                  </AGButton>
                </div>
              </div>
            </div>
            {/* ASSET SELECTOR */}
            <div className="w-full overflow-scroll h-[167px] py-2">
              {
                optionList &&
                <MobileOptionSelectorUI
                  list={optionList}
                  activeOption={selectedOption}
                  handleClick={(id: string, path: string, name: string) => onOptionChange(id, path, name)}
                />
              }
            </div>
          </div>
        }
      </div>
      {shouldShowColorSelectorModal && <MobileColorSelectorUI
        list={campaignSkinColorConfig.colorPalette}
        activeColor={skinColor}
        handleChangeColor={(value: string) => void onSkinColorChange(value)}
        handleSwitchShowColorSelector={() => setShouldShowColorSelectorModal(false)}
      />}
      {/* DESKTOP UI */}
      <div className={`fixed inset-0 ${editModeSelected ? 'w-[58%]' : 'w-0'} overflow-hidden h-screen bg-bg hidden xl:block transition-all duration-300`}>
        {/* CAMPAIGN HEADER SIGN */}
        {!isCustomCampaignHud && <div className="fixed flex right-0 top-0 justify-center items-center gap-1 py-3 px-8 max-w-lg">
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
        </div>}
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
                <HudFeatureTitleUI selectedFeature={RemovedAcc(selectedCategory)} />
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
      {
        !isCustomCampaignHud && !editModeSelected && <div className="fixed pt-8 pl-8 w-fit h-fit hidden xl:flex">
          <AGButton onClickEvent={() => changeView()}>
            <div className="flex items-center justify-between">
              <p className="font-poppins text-center w-[120px] py-2">EDIT</p>
            </div>
          </AGButton>
          <ExportButtonUI allowExtension={exportAllow} onClickEvent={(type) => exportModel(type)} >
            <div className="flex items-center justify-between">
              <p className="font-poppins text-center w-[120px] py-2">EXPORT</p>
            </div>
          </ExportButtonUI>
        </div>
      }
    </>
  )
}