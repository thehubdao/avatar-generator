import { useState } from "react";
import { RxAvatar } from "react-icons/rx";
import AGButton from "../../../common/ag-button.component";
import { AiOutlineCloudDownload, AiOutlineEye, AiOutlinePauseCircle, AiOutlineVideoCamera } from "react-icons/ai";
import { MdKeyboardArrowDown, MdOutlineColorLens } from "react-icons/md";
import ColorPicker from "./colorPicker.ui";
import { IoSettingsOutline } from "react-icons/io5";
import { BsLightbulb } from "react-icons/bs";
import { CampaignConfig } from "../../../../interfaces/common.interface";

interface ConfigCampaignProps {
  configData?: CampaignConfig
}

export default function ConfigCampaign({configData}: ConfigCampaignProps) {
  const [openConfig, setOpenConfig] = useState<boolean>(false);
  const [configOption, setConfigOption] = useState<string>('base');

  const changeConfigOption = (e: React.MouseEvent, destiny: string) => {
    const target = e.target as HTMLElement;
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
  
  return (
    <>
      {/* AVATAR GENERAL INFO */}
      <div className="absolute w-fit h-fit inset-0 p-4 flex flex-col justify-between">
        {
          openConfig &&
          <div className="pl-16">
            {/* CONFIG */}
            <div className="relative bg-purple p-5 rounded-2xl">
              {/* CONFIG BOXES */}
              <div className="flex flex-col gap-4">
                {/* SPECIFIC AVATAR CONFIG */}
                {
                  configOption === 'base' &&
                  <div className="bg-bg shadow-inset-hard rounded-xl p-4 h-fit">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                        <RxAvatar />
                      </div>
                      <p className="font-poppins font-bold text-purple">AVATAR BASE</p>
                    </div>
                    <div className="flex mt-5">
                      <AGButton fit nm>
                        <div className="flex items-center p-2 gap-2">
                          <AiOutlineEye />
                          <p>View Armature</p>
                        </div>
                      </AGButton>
                      <AGButton fit nm>
                        <div className="flex items-center p-2 gap-2">
                          <AiOutlineCloudDownload />
                          <p>Download</p>
                        </div>
                      </AGButton>
                      {/* <AGButton fit nm>
                        <div className="flex items-center p-2 gap-2">
                          <AiOutlineCloudUpload />
                          <p>Update</p>
                        </div>
                      </AGButton> */}
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 px-2">Default animation:</p>
                    <div className="flex justify-between">
                      <AGButton fit nm>
                        <div className="py-3 px-2">
                          {/* <AiOutlinePlayCircle /> */}
                          <AiOutlinePauseCircle />
                        </div>
                      </AGButton>
                      <div className="relative mt-2 w-[81.5%] cursor-pointer pr-2">
                        <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                          <MdKeyboardArrowDown />
                        </div>
                        <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                          <option defaultValue={'animation'} className="bg-bg py-2 px-4">animation</option>
                        </select>
                      </div>
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 px-2">Default environment:</p>
                    <div className="flex justify-between">
                      <AGButton fit nm>
                        <div className="py-3 px-2">
                          {/* <AiOutlineEyeInvisible /> */}
                          <AiOutlineEye />
                        </div>
                      </AGButton>
                      <div className="relative mt-2 w-[81.5%] cursor-pointer pr-2">
                        <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                          <MdKeyboardArrowDown />
                        </div>
                        <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                          <option defaultValue={'env-1'} className="bg-bg py-2 px-4">env-1</option>
                        </select>
                      </div>
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 px-2">Default skybox:</p>
                    <div className="flex justify-between">
                      <AGButton fit nm>
                        <div className="py-3 px-2">
                          {/* <AiOutlineEyeInvisible /> */}
                          <AiOutlineEye />
                        </div>
                      </AGButton>
                      <div className="relative mt-2 w-[81.5%] cursor-pointer pr-2">
                        <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                          <MdKeyboardArrowDown />
                        </div>
                        <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                          <option defaultValue={'env-1'} className="bg-bg py-2 px-4">skybox-1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                }
                {/* COLOR CONFIG */}
                {
                  configOption === 'color' &&
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
                      <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                        <option defaultValue={'Skin color'} className="bg-bg py-2 px-4">Skin color</option>
                      </select>
                    </div>
                    <div className="px-2">
                      <ColorPicker color="#ff0000" id="skin" specificPalette />
                    </div>
                  </div>
                }
                {/* CAMERA CONFIG */}
                {
                  configOption === 'camera' &&
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
                      <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer">
                        <option defaultValue={'Skin color'} className="bg-bg py-2 px-4">Default camera</option>
                      </select>
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">Camera position:</p>
                    <div className="flex gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <p>X:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.pos?.x} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Y:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.pos?.y} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Z:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.pos?.z} />
                      </div>
                    </div>
                    <p className="font-poppins font-medium text-purple pt-4 px-2">Camera look at:</p>
                    <div className="flex gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <p>X:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.lookAt?.x} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Y:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.lookAt?.y} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Z:</p>
                        <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={configData?.defCam?.lookAt?.z} />
                      </div>
                    </div>
                  </div>
                }
                {/* SPECIFIC LIGHT CONFIG */}
                {
                  configOption === 'light' &&
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
          <div className={`w-12 bg-purple rounded-full p-1 overflow-hidden ${openConfig ? 'h-fit' : 'h-12'}`}>
            <div onClick={() => setOpenConfig(!openConfig)} className="w-10 h-10 text-2xl text-purple bg-white rounded-full flex justify-center items-center cursor-pointer">
              <IoSettingsOutline className="pointer-events-none" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div onClick={e => changeConfigOption(e, 'base')} className={`w-10 h-10 text-2xl bg-white rounded-full flex justify-center items-center cursor-pointer text-purple bg-opacity-100 shadow-none`}>
                <RxAvatar className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, 'color')} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer">
                <MdOutlineColorLens className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, 'camera')} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer">
                <AiOutlineVideoCamera className="pointer-events-none" />
              </div>
              <div onClick={e => changeConfigOption(e, 'light')} className="w-10 h-10 text-2xl text-white bg-white bg-opacity-30 shadow-inset-soft hover:opacity-70 rounded-full flex justify-center items-center opacity-40 cursor-pointer">
                <BsLightbulb className="pointer-events-none" />
              </div>
            </div>
          </div>
          {/* COUNT INFO */}
          {/* <div className="flex gap-4">
                    <div className="flex items-center gap-2 p-2 text-sm rounded-full bg-orange">
                      <p className="text-white pl-2">Features</p>
                      <div className="flex justify-center items-center w-6 h-6 rounded-full shadow-inset-hard bg-bg">
                        <p className="font-bold text-orange">{data.features.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 text-sm rounded-full bg-orange">
                      <p className="text-white pl-2">Accessories</p>
                      <div className="flex justify-center items-center w-6 h-6 rounded-full shadow-inset-hard bg-bg">
                        <p className="font-bold text-orange">{data.accessories.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 text-sm rounded-full bg-blue">
                      <p className="text-white pl-2">Animations</p>
                      <div className="flex justify-center items-center w-6 h-6 rounded-full shadow-inset-hard bg-bg">
                        <p className="font-bold text-blue">!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 text-sm rounded-full bg-blue">
                      <p className="text-white pl-2">Environments</p>
                      <div className="flex justify-center items-center w-6 h-6 rounded-full shadow-inset-hard bg-bg">
                        <p className="font-bold text-blue">!</p>
                      </div>
                    </div>
                  </div> */}
        </div >
      </div >
    </>
  )
}