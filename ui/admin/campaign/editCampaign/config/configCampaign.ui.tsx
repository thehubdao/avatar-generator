import { MouseEvent, useRef, useState } from "react";
import { RxAvatar } from "react-icons/rx";
import AGButton from "../../../../common/ag-button.component";
import {
  AiOutlineCheckCircle,
  AiOutlineCloudDownload,
  AiOutlineCloudUpload,
  AiOutlineEye,
  AiOutlineVideoCamera
} from "react-icons/ai";
import { MdKeyboardArrowDown, MdOutlineColorLens } from "react-icons/md";
import ColorConfigUI from "./colorConfig.ui";
import { IoSettingsOutline } from "react-icons/io5";
import { BsLightbulb } from "react-icons/bs";
import { CampaignConfig, ColorConfig, FeatureBasic, LookAtVectors } from "../../../../../interfaces/common.interface";
import { CameraConfigOption, CampaignConfigOption } from "../../../../../enums/campaign.enum";
import CameraConfigUI from "./cameraConfig.ui";

interface ConfigCampaignProps {
  configData?: CampaignConfig;
  featuresList?: FeatureBasic[];
  downloadAvatarBase: (() => void) | (() => Promise<void>);
  updateColorConfig: (element: string, colorConfig: ColorConfig) => Promise<void>;
  updateCameraConfig: (element: string, colorConfig: LookAtVectors) => Promise<void>;
  uploadAvatarBase: (avatarBase: File | undefined) => Promise<void>;
}

export default function ConfigCampaignUI({ configData, featuresList, downloadAvatarBase, updateColorConfig, updateCameraConfig, uploadAvatarBase }: ConfigCampaignProps) {
  const [shouldOpenConfig, setShouldOpenConfig] = useState<boolean>(false);
  const [configOption, setConfigOption] = useState<string>(CampaignConfigOption.Base);
  const [colorOption, setColorOption] = useState<string>('avatarHubSkin'); //TODO make enum to color config
  const [camOption, setCamOption] = useState<string>(CameraConfigOption.DefCam);
  const [hasNewAvatarBase, setHasNewAvatarBase] = useState<boolean>(false);

  const colorConfig = useRef<HTMLSelectElement>(null);
  const camConfig = useRef<HTMLSelectElement>(null);
  const avatarBaseFile = useRef<HTMLInputElement>(null);

  const changeConfigOption = (e: MouseEvent<HTMLDivElement>, destiny: string) => {
    const target = e.currentTarget as HTMLElement;
    const elements = target.parentNode?.childNodes;

    if (elements) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index] as HTMLElement;
        element.classList.remove('opacity-100', 'text-purple', 'bg-opacity-100', 'shadow-none');
        element.classList.add('opacity-40', 'text-white', 'bg-opacity-30', 'shadow-inset-soft', 'hover:opacity-70');
      }
    }

    target.classList.remove('opacity-40', 'text-white', 'bg-opacity-30', 'shadow-inset-soft', 'hover:opacity-70');
    target.classList.add('opacity-100', 'text-purple', 'bg-opacity-100', 'shadow-none');

    setConfigOption(destiny);
  }

  const changeColorConfigOption = () => {
    setColorOption(colorConfig.current?.value ?? '');
  }

  const changeCamConfigOption = () => {
    setCamOption(camConfig.current?.value ?? '');
  }

  return (
    <>
      {/* AVATAR GENERAL INFO */}
      <div className="absolute w-fit h-fit inset-0 p-4 flex flex-col justify-between">
        {
          shouldOpenConfig &&
          <div className="pl-16">
            {/* CONFIG */}
            <div className="relative bg-purple p-5 rounded-2xl">
              {/* CONFIG BOXES */}
              <div className="flex flex-col gap-4">
                {/* BASE CONFIG */}
                {
                  configOption === CampaignConfigOption.Base &&
                  <div className="bg-bg shadow-inset-hard rounded-xl p-4 h-fit">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                        <RxAvatar />
                      </div>
                      <p className="font-poppins font-bold text-purple">AVATAR BASE</p>
                    </div>
                    <div className="flex mt-3">
                      <AGButton fit nm>
                        <div className="flex items-center p-2 gap-2 cursor-not-allowed">
                          <AiOutlineEye />
                          <p>View Armature</p>
                        </div>
                      </AGButton>
                      <AGButton fit nm onClickEvent={() => downloadAvatarBase()}>
                        <div className="flex items-center p-2 gap-2">
                          <AiOutlineCloudDownload />
                          <p>Download</p>
                        </div>
                      </AGButton>
                    </div>
                    <div className="flex">
                      <label className={`w-full flex justify-center m-2 p-2 gap-2 min-h-[32px] items-center shadow-flat-soft hover:shadow-flat-medium rounded-lg cursor-pointer transition-all duration-300 ${hasNewAvatarBase ? 'bg-green-400 text-white' : ''}`}
                        htmlFor="avatarBaseFile">
                        <AiOutlineCloudUpload className="ml-2" />
                        <p className="my-1 pr-2">Update Base</p>
                        <input type="file" id="avatarBaseFile" name="avatarBaseFile" className="hidden" accept=".glb"
                          ref={avatarBaseFile}
                          onChange={() => setHasNewAvatarBase(!!avatarBaseFile.current?.files?.length)} />
                      </label>
                      {hasNewAvatarBase &&
                        <AGButton nm fit onClickEvent={() => uploadAvatarBase(avatarBaseFile.current?.files?.item(0) ?? undefined)}>
                          <div className="flex items-center p-2 gap-2 group">
                            <AiOutlineCheckCircle className="group-hover:text-green-400 transition-all duration-300" />
                            Upload
                          </div>
                        </AGButton>}
                    </div>
                  </div>
                }
                {/* COLOR CONFIG */}
                {
                  configOption === CampaignConfigOption.Color &&
                  <div className="bg-bg shadow-inset-hard rounded-xl p-4 h-fit min-w-[300px]">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                        <MdOutlineColorLens />
                      </div>
                      <p className="font-poppins font-bold text-purple">COLORS</p>
                    </div>
                    <div className="relative mt-5 w-full cursor-pointer px-2">
                      <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                        <MdKeyboardArrowDown />
                      </div>
                      <select ref={colorConfig} className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" onChange={() => changeColorConfigOption()}>
                        <option value={'avatarHubSkin'} className="bg-bg py-2 px-4" >Skin color</option>
                        {/* put here the features and accessories filtered by isMulticolor boolean data */}
                      </select>
                    </div>
                    {
                      colorOption === 'avatarHubSkin' &&
                      <ColorConfigUI
                        materialName={configData?.skin?.materialName ?? ''}
                        color={configData?.skin?.defColor ?? 'FFFFFF'}
                        id="configColorPicker"
                        usePalette={configData?.skin?.usePalette ?? false}
                        colorList={configData?.skin?.colorPalette}
                        updateColorConfig={(colorConfig: ColorConfig) => updateColorConfig(colorOption, colorConfig)}
                      />
                    }
                  </div>
                }
                {/* CAMERA CONFIG */}
                {
                  configOption === CampaignConfigOption.Camera &&
                  <div className="bg-bg shadow-inset-hard rounded-xl p-4 w-fit">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                        <AiOutlineVideoCamera />
                      </div>
                      <p className="font-poppins font-bold text-purple">CAMERAS</p>
                    </div>
                    <div className="relative mt-5 w-full cursor-pointer px-2">
                      <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                        <MdKeyboardArrowDown />
                      </div>
                      <select ref={camConfig} className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" onChange={() => changeCamConfigOption()}>
                        <option value={'defCam'} className="bg-bg py-2 px-4">Default camera</option>
                        {
                          featuresList ?
                            featuresList?.map((feature, index) => <option key={index} value={feature.displayName} className="bg-bg py-2 px-4">{feature.displayName}</option>)
                            : <option value='no features' className="bg-bg py-2 px-4" disabled>no features</option>
                        }
                      </select>
                    </div>
                    <CameraConfigUI
                      key={camOption}
                      camConfig={camOption === CameraConfigOption.DefCam ? configData?.defCam : configData?.featuresCamPos ? configData?.featuresCamPos[camOption] : undefined}
                      updateCameraConfig={(camConfig: LookAtVectors) => updateCameraConfig(camOption, camConfig)}
                    />
                  </div>
                }
                {/* SPECIFIC LIGHT CONFIG */}
                {
                  configOption === CampaignConfigOption.Light &&
                  <div className="bg-bg shadow-inset-hard rounded-xl p-4 w-fit">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                        <AiOutlineVideoCamera />
                      </div>
                      <p className="font-poppins font-bold text-purple">LIGHTS</p>
                    </div>
                    <div className="relative mt-5 w-full cursor-pointer px-2">
                      <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                        <MdKeyboardArrowDown />
                      </div>
                      <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                        <option defaultValue={'Skin color'} className="bg-bg py-2 px-4">Default light</option>
                      </select>
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">Light position:</p>
                    <div className="flex gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <p>X:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.lights ? configData?.lights[0].params.pos?.x : 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Y:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.lights ? configData?.lights[0].params.pos?.y : 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Z:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.lights ? configData?.lights[0].params.pos?.z : 0} />
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div >
        }
        {/* CONFIG MENU */}
        <div className="absolute inset-4 w-fit h-fit flex gap-4" >
          <div className={`w-12 bg-purple rounded-full p-1 overflow-hidden ${shouldOpenConfig ? 'h-fit' : 'h-12'}`}>
            <div onClick={() => setShouldOpenConfig(!shouldOpenConfig)} className="w-10 h-10 text-2xl text-purple bg-white rounded-full flex justify-center items-center cursor-pointer">
              <IoSettingsOutline className="pointer-events-none" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div onClick={e => changeConfigOption(e, CampaignConfigOption.Base)} className={`w-10 h-10 text-2xl bg-white rounded-full flex justify-center items-center cursor-pointer text-purple bg-opacity-100 shadow-none`}>
                <RxAvatar className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, CampaignConfigOption.Color)} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer">
                <MdOutlineColorLens className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, CampaignConfigOption.Camera)} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer">
                <AiOutlineVideoCamera className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, CampaignConfigOption.Light)} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer hidden">
                <BsLightbulb className="pointer-events-none" />
              </div>
            </div>
          </div>
        </div >
      </div >
    </>
  )
}