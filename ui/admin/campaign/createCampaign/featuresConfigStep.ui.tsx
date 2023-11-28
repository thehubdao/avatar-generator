import { IoAlert } from "react-icons/io5";
import AGButton from "../../../common/ag-button.component";
import { useSwiper } from "swiper/react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { setFeatures } from "../../../../store/addCampaignSlice";
import { IoMdArrowBack } from "react-icons/io";
import { FeatureBasic } from "../../../../interfaces/common.interface";
import { FeaturesIcons } from "../../../../enums/icons.enum";


interface FeaturesConfigStepUIProps {
  ready: boolean;
  featuresCount: number;
}

const featureBase = {
  meshName: '',
  displayName: '',
  index: 1,
  hasCustomIcon: false,
  iconUrl: '',
  isMulticolor: false
};

type FeatureStringOption = keyof Omit<FeatureBasic, 'hasCustomIcon' | 'isMulticolor'>;

export default function FeaturesConfigStepUI({ ready = false, featuresCount }: FeaturesConfigStepUIProps) {
  const swiper = useSwiper();
  const [featureSelected, setFeatureSelected] = useState<number>(0);
  const features = useAppSelector(state => state.addCampaign.features);
  const dispatch = useAppDispatch();
  const [featureList, setFeatureList] = useState<FeatureBasic[]>(features || []);

  function updateString(value: string, key: FeatureStringOption) {
    setFeatureList((prevState) => {
      const oldState = [...prevState];
      if (oldState[featureSelected] == undefined)
        oldState[featureSelected] = { ...featureBase };

      oldState[featureSelected] = { ...oldState[featureSelected], [key]: value.trim() };
      return oldState;
    })
  }

  // function updateBoolean(value: boolean, key: FeatureBooleanOption) {
  //   setFeatureList((prevState) => {
  //     const oldState = [...prevState];
  //     if (oldState[featureSelected] == undefined)
  //       oldState[featureSelected] = { ...featureBase };

  //     oldState[featureSelected] = { ...oldState[featureSelected], [key]: value };
  //     return oldState;
  //   })
  // }

  function updateNumber(value: number, key: FeatureStringOption) {
    setFeatureList((prevState) => {
      const oldState = [...prevState];
      if (oldState[featureSelected] == undefined)
        oldState[featureSelected] = { ...featureBase };

      oldState[featureSelected] = { ...oldState[featureSelected], [key]: value };
      return oldState;
    })
  }

  function updateFeaturesState() {
    dispatch(setFeatures(featureList));
    swiper.slideNext();
  }

  return (
    <div className="flex flex-col justify-between px-5">
      <div className="pb-20">
        <h2 className="text-2xl text-orange font-poppins font-bold">FEATURES SETUP</h2>
        <div className="relative bg-orange p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
          <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-orange"></div>
          <div className="w-10 h-10 text-4xl text-orange bg-white rounded-full flex justify-center items-center">
            <IoAlert />
          </div>
          <div className="text-white text-sm">
            <p>
              <b>Remember:</b> Every feature must be called as the <b>feature mesh name</b> in the 3D file. Refer to names in the .GLB file.
            </p>
          </div>
        </div>
        <div className="relative mt-5 w-full cursor-pointer">
          <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
            <MdKeyboardArrowDown />
          </div>
          <select className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" value={featureSelected} onChange={e => {
            setFeatureSelected(parseInt(e.target.value))
          }}>
            {
              Array(featuresCount).fill(null).map((x, index) => {
                return (
                  <option key={index} value={index} className="bg-bg py-2 px-4">Feature {index + 1}</option>
                )
              })
            }
          </select>
        </div>
        <div>
          <div className="flex justify-between gap-8 pt-4">
            <div className="flex items-center gap-2 w-full">
              <p className="whitespace-nowrap">Display Name:</p>
              <input type="text" value={featureList[featureSelected]?.displayName || ''} className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg bg-bg"
                onChange={(e) => updateString(e.currentTarget.value, 'displayName')} />
            </div>
            <div className="flex items-center gap-2">
              <p>Index:</p>
              <input type="number" value={featureList[featureSelected]?.index || (featureSelected + 1)} className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-16 rounded-lg text-center bg-bg"
                onChange={(e) => updateNumber(e.currentTarget.valueAsNumber, 'index')} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 w-full">
              <p className="whitespace-nowrap">Feature mesh Name:</p>
              <input type="text" value={featureList[featureSelected]?.meshName || ''} className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg bg-bg"
                onChange={(e) => updateString(e.currentTarget.value, 'meshName')} />
            </div>
          </div>
          <div className="grid grid-cols-2 items-center w-full py-4">
            {/* TODO add custom icon to features via URL or uploading file */}
            {/* <div>
              <label htmlFor={'feature-checkbox-1'} className="relative w-6 h-6 shadow-inset-soft bg-bg rounded-lg flex justify-center items-center cursor-pointer">
                <div className={`w-3 h-3 bg-orange rounded-full ${featureList[featureSelected]?.hasCustomIcon ? '' : 'hidden'}`}></div>
                <p className="absolute left-[120%] whitespace-nowrap select-none">Custom icon</p>
              </label>
              <input type="checkbox" id={'feature-checkbox-1'} checked={featureList[featureSelected]?.hasCustomIcon || false} onChange={(e) => updateBoolean(e.currentTarget.checked, 'hasCustomIcon')} className="absolute hidden" />
            </div> */}
            <div className="flex gap-2 items-center">
              <p className="whitespace-nowrap">Icon:</p>
              <select
                value={featureList[featureSelected]?.iconUrl || 'a'}
                onChange={e => {
                  updateString(e.currentTarget.value, 'iconUrl')
                }}
                className="font-featuresIcons text-4xl text-center leading-none text-gray-normal bg-bg shadow-flat-medium hover:shadow-flat-hard w-16 h-16 rounded-lg cursor-pointer"
              >
                {
                  Object.values(FeaturesIcons).map((icon, index) => <option key={index} value={icon}>{icon}</option>)
                }
              </select>
            </div>
            {/* TODO multicolor selection on features */}
            {/* <div>
              <label htmlFor={'feature-checkbox-2'} className="relative w-6 h-6 shadow-inset-soft bg-bg rounded-lg flex justify-center items-center cursor-pointer">
                <div className={`w-3 h-3 bg-orange rounded-full ${featureList[featureSelected]?.isMulticolor ? '' : 'hidden'}`}></div>
                <p className="absolute left-[120%] whitespace-nowrap select-none">Multicolor</p>
              </label>
              <input type="checkbox" id={'feature-checkbox-2'} checked={featureList[featureSelected]?.isMulticolor || false} onChange={(e) => updateBoolean(e.currentTarget.checked, 'isMulticolor')} className="absolute hidden" />
            </div> */}
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex">
        <AGButton nm fit align="start" onClickEvent={() => {
          swiper.slidePrev();
        }}>
          <IoMdArrowBack />
        </AGButton>
        {
          ready && featureList.length === featuresCount &&
          <AGButton nm align="start" onClickEvent={() => {
            updateFeaturesState();
          }}>
            Continue
          </AGButton>
        }
      </div>
    </div>
  )
}