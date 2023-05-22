import { useCallback, useEffect, useState } from "react";
import Image from 'next/image';
import { FirestoreLocation } from "../../../enums/firebase.enum";
import { DeleteDoc, GetFileUrl, GetFileUrl, GetInfoDB } from "../../../utils/firebase.util";
import AGButton from "../../../components/common/ag-button.component";
import AGText from "../../../components/common/ag-text.component";
import { AdminComponents } from "../../../enums/common.enum";
import { ChangeComponentFunction } from "../../../interfaces/common.interface";
import { AccessoryInterface, AnimationInterface, FeatureInterface } from "../../../interfaces/api.interface";
import { CampaignParameters } from '../../../interfaces/common.interface'
import {AdminComponents} from "../../../enums/common.enum";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";
import {
  AccessoryInterfaceProps,
  AnimationInterfaceProps,
  CampaignInterfaceProps,
  EnvironmentInterfaceProps,
  FeatureInterfaceProps
} from "../../../constants/obj-props.constant";
import {AssetType} from "../../../types/asset.type";

// Icons
import { AiOutlineLink, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlineHome, AiOutlineCloudDownload, AiOutlineCloudUpload, AiOutlinePauseCircle, AiOutlineVideoCamera } from "react-icons/ai";
import { IoMdAddCircleOutline } from 'react-icons/io';
import { IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineColorLens } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';

// Icons
import { AiOutlineLink, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlineHome, AiOutlineCloudDownload, AiOutlineCloudUpload, AiOutlinePauseCircle, AiOutlineVideoCamera } from "react-icons/ai";
import { IoMdAddCircleOutline } from 'react-icons/io';
import { IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineColorLens } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';

interface AssetListProps {
  campaign?: string;
  changeComponent: ChangeComponentFunction;
}

interface ThumbnailProps {
  opt: FeatureInterface | AccessoryInterface | AnimationInterface | CampaignParameters;
}

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

function Thumbnail({ opt }: ThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const newImage = await GetFileUrl(opt.thumb);
      setImageUrl(newImage ?? '/resources/images/image.png');
    })().catch(err => console.error(err));
  }, [opt])

  return (
    <>
      {imageUrl == undefined ?
        <div className='w-[192px] h-[192px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700 blur-md'>
          <Image src={'/resources/images/image.png'} width={192} height={192} alt={opt.name ?? 'thumbnail'} />
        </div> :
        <div className='w-[192px] h-[192px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700'>
          <Image placeholder="blur" blurDataURL="/resources/images/image.png"
            src={imageUrl} width={192} height={192} alt={opt.name ?? 'thumbnail'} />
        </div>
      }
    </>
  );
}

function ColorPicker({ color, id, specificPalette, colorList }: ColorPickerProps) {
  const [defaultColor, setDefaultColor] = useState<string>(color);
  const [paletteSelector, setPaletteSelector] = useState<boolean>(specificPalette);
  const [paletteLength, setPaletteLength] = useState<number>(colorList?.length || 0);
  const [paletteColors, setPaletteColors] = useState<string[]>(colorList || []);

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

  useEffect(() => {
    //* function to set palette colors on data base here
    // eslint-disable-next-line no-console
    console.log('palette colors: ', paletteColors);
  }, [paletteColors]);

  return (
    <>
      <div className="my-2">
        <div className="pt-3 pb-4 flex gap-2">
          <label htmlFor={id + '-colorselector'} className="relative w-6 h-6 shadow-inset-hard bg-bg rounded-full flex justify-center items-center cursor-pointer">
            <div className={`w-3 h-3 bg-purple rounded-full ${paletteSelector ? '' : 'hidden'}`}></div>
            <p className="absolute left-[120%] whitespace-nowrap select-none">with specific palette</p>
          </label>
          <input type="checkbox" id={id + '-colorselector'} checked={paletteSelector} onChange={e => { setPaletteSelector(e.target.checked) }} className="absolute hidden" />
        </div>
        {
          paletteSelector ?
            <div>
              <div className="flex items-center gap-2">
                <p className="font-poppins font-medium text-purple">Colors number:</p>
                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" min='5' max='20' defaultValue={paletteLength} onChange={e => {
                  setPaletteLength(parseInt(e.target.value));
                }} />
                <AGButton nm onClickEvent={() => {
                  setNewPalette();
                }}>
                  <p className="py-2">Set</p>
                </AGButton>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-poppins font-medium text-purple">Default color:</p>
                <div className="relative mt-2 w-[80px] cursor-pointer">
                  <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                    <MdKeyboardArrowDown />
                  </div>
                  <select name="" id="" className="bg-bg shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-full cursor-pointer">
                    {
                      paletteColors.map((el, index) => {
                        return (
                          <option key={index + 1} value={index + 1} className="relative bg-bg py-2 px-4 h-12">{index + 1}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>
              <p className="font-poppins font-medium text-purple pb-2">Palette:</p>
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

export default function AssetList({ campaign, changeComponent }: AssetListProps) {
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Parameters);
  const [dbData, setDbData] = useState<AssetType[]>();
  const [dbHeaders, setDbHeaders] = useState<string[]>();

  const locationOptions: string[] = Object.keys(FirestoreLocation);

  const setHeaders = useCallback(() => {
    switch (dbLocation) {
      case FirestoreLocation.Features:
        return FeatureInterfaceProps;
      case FirestoreLocation.Accessories:
        return AccessoryInterfaceProps;
      case FirestoreLocation.Animations:
        return AnimationInterfaceProps;
      case FirestoreLocation.Parameters:
        return CampaignInterfaceProps;
      case FirestoreLocation.Environments:
        return EnvironmentInterfaceProps;
    }
  }, [dbLocation]);

  const getDbInfo = useCallback(async (location: FirestoreLocation = dbLocation) => {
    // const data = await SessionDBInfo(location, campaign, forceUpdate);
    const data = await GetInfoDB<AssetType>(location, campaign);
    setDbData(data);
  }, [dbLocation, campaign]);

  useEffect(() => {
    const componentDidMount = async () => {
      await getDbInfo();
    };

    componentDidMount()
      .catch(err => console.error(err));
  }, [getDbInfo]);

  useEffect(() => {
    const headers = setHeaders().map(h => h.prop);
    setDbHeaders(headers);
  }, [setHeaders])

  async function changeDbLocation(newLocation: string) {
    setDbLocation(newLocation as FirestoreLocation);
    await getDbInfo(newLocation as FirestoreLocation);
  }

  function renderButtonOptions() {
    return locationOptions.map(x => {
      const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
      return <div className={`${x === 'Parameters' ? 'order-1 text-2xl' : 'order-2'}`} key={x}>
        <AGButton nm selected={dbLocation == val ? true : false} fit={x === 'Parameters' ? true : false} onClickEvent={() => void changeDbLocation(val)}>
          <div className={`flex items-center gap-2 p-2`}>
            <div className={`font-poppins uppercase ${dbLocation == val ? ' font-semibold' : ''}`}>
              {x === 'Parameters' ?
                <AiOutlineHome />
                :
                x
              }
            </div>
          </div>
        </AGButton>
      </div>
    });
  }

  async function deleteDoc(docId: string) {
    const result = await DeleteDoc(dbLocation, docId, campaign);
    alert(`Doc "${result}" has been deleted.`);
    await getDbInfo();
  }

  function copyToClipboard(text: string) {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }

  function Card() {
    return (
      <div className="rounded-2xl h-[700px] w-[500px] flex flex-col justify-center items-center shadow-flat-soft hover:shadow-flat-hard overflow-hidden">
        <div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-end">
        </div>
      </div>
    )
  }
  
  async function openFileLink(path: string) {
    const fileLink = await GetFileUrl(path);
    if (fileLink != undefined) {
      window.open(fileLink, '_blank');
    }
  }

  function renderInfo() {
    if (dbData && dbHeaders) {
      let id = 0;
      // eslint-disable-next-line no-console
      console.log("data: ", dbData);
      if (dbLocation !== '/') {
        return dbData.map(datum => {
          id += 1;
          return (
            <div key={id} className="w-56 p-4 shadow-flat-soft bg-light hover:shadow-flat-hard transition-all duration-300">
              {/* DATA */}
              <div className="text-left">
                {datum.name && <p className="text-xl font-medium uppercase overflow-hidden text-ellipsis whitespace-nowrap shadow-inset-medium max-w-full py-1 px-3 rounded-md">{datum.name}</p>}
                {datum.type && <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap my-2"><span className="font-medium">Type:</span> {datum.type}</p>}
              </div>
              {/* THUMBNAIL */}
              <div>
                <Thumbnail opt={datum} />
              </div>
              {/* ACTION BUTTONS */}
              <div className="flex justify-between text-xl pt-6">
                <div className="flex gap-2">
                  <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-blue transition-all duration-300"
                    title={datum.path}
                    onClick={() => { copyToClipboard(datum.path) }}>
                    <AiOutlineLink />
                  </button>
                  <div className="shadow-inset-hard p-2 rounded-full text-gray-light cursor-not-allowed">
                    <AiOutlineEye />
                  </div>
                </div>
                <div className="flex justify-end items-center gap-2">
                  <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-purple transition-all duration-300"
                    title="Edit"
                    onClick={() => changeComponent(AdminComponents.AssetModify, {
                      docLocation: `${dbLocation}${datum.id != undefined ? '/' + datum.id : ''}`
                    })}>
                    <AiOutlineEdit />
                  </button>
                  {dbLocation !== FirestoreLocation.Parameters &&
                    <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-orange transition-all duration-300"
                      title="Delete"
                      onClick={
                        () => void deleteDoc(datum.id)
                      }>
                      <AiOutlineDelete />
                    </button>
                  }
                </div>
              </div>
            </div>
          )
        });
      } else if (dbData[0].owner) {
        return dbData.map(data => {
          id += 1;
          return (
            <>
              <div className="flex gap-6 pb-8" key={id}>
                {/* AVATAR SINGLE VIEW */}
                <Card />
                {/* AVATAR GENERAL INFO */}
                <div className="flex flex-col justify-between">
                  <div>
                    {/* GENERAL INFO TITLE */}
                    <h2 className="text-2xl text-purple font-poppins font-bold pb-4">AVATAR SETUP</h2>
                    {/* COUNT INFO */}
                    <div className="flex gap-4">
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
                    </div>
                    {/* CONFIG */}
                    <div className="relative bg-purple p-5 rounded-r-2xl rounded-bl-2xl mt-4">
                      <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-purple"></div>
                      {/* CONFIG TITLE */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 text-2xl text-purple bg-white rounded-full flex justify-center items-center">
                          <IoSettingsOutline />
                        </div>
                        <div className="text-white text-sm">
                          <h3 className="text-xl font-poppins font-bold">
                            CONFIG
                          </h3>
                        </div>
                      </div>
                      {/* CONFIG BOXES */}
                      <div className="pt-4 flex gap-4">
                        {/* SPECIFIC AVATAR CONFIG */}
                        <div className="flex flex-col gap-4">
                          {/* AVATAR BASE CONFIG */}
                          <div className="bg-bg shadow-inset-hard rounded-xl p-4 h-fit">
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                                <RxAvatar />
                              </div>
                              <p className="font-poppins font-bold text-purple">AVATAR BASE</p>
                            </div>
                            <div className="flex">
                              <AGButton fit nm>
                                <div className="flex items-center p-2 gap-2">
                                  <AiOutlineEye />
                                  <p>View</p>
                                </div>
                              </AGButton>
                              <AGButton fit nm>
                                <div className="flex items-center p-2 gap-2">
                                  <AiOutlineCloudDownload />
                                  <p>Download</p>
                                </div>
                              </AGButton>
                              <AGButton fit nm>
                                <div className="flex items-center p-2 gap-2">
                                  <AiOutlineCloudUpload />
                                  <p>Update</p>
                                </div>
                              </AGButton>
                            </div>
                            <p className="font-poppins font-medium text-purple pt-4">Default animation:</p>
                            <div className="flex justify-between">
                              <AGButton fit nm>
                                <div className="py-3 px-2">
                                  {/* <AiOutlinePlayCircle /> */}
                                  <AiOutlinePauseCircle />
                                </div>
                              </AGButton>
                              <div className="relative mt-2 w-[90%] cursor-pointer">
                                <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                                  <MdKeyboardArrowDown />
                                </div>
                                <select name="" id="" className="bg-bg shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-full cursor-pointer">
                                  <option defaultValue={data.config.defAnimation} className="bg-bg py-2 px-4">{data.config.defAnimation}</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          {/* COLOR CONFIG */}
                          <div className="bg-bg shadow-inset-hard rounded-xl p-4 h-fit min-w-[300px]">
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                                <MdOutlineColorLens />
                              </div>
                              <p className="font-poppins font-bold text-purple">COLORS</p>
                            </div>
                            <div className="relative mt-2 w-full cursor-pointer">
                              <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                                <MdKeyboardArrowDown />
                              </div>
                              <select name="" id="" className="bg-bg shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-full cursor-pointer">
                                <option defaultValue={'Skin color'} className="bg-bg py-2 px-4">Skin color</option>
                              </select>
                            </div>
                            <ColorPicker color="#ff0000" id="skin" specificPalette colorList={colorArr} />
                          </div>
                        </div>
                        {/* SPECIFIC CAMERA CONFIG */}
                        <div>
                          {/* CAMERA CONFIG */}
                          <div className="bg-bg shadow-inset-hard rounded-xl p-4 w-fit">
                            <div className="flex gap-2 items-center">
                              <div className="w-8 h-8 text-base bg-purple text-white rounded-full flex justify-center items-center">
                                <AiOutlineVideoCamera />
                              </div>
                              <p className="font-poppins font-bold text-purple">CAMERAS</p>
                            </div>
                            <div className="relative mt-2 w-full cursor-pointer pb-2">
                              <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                                <MdKeyboardArrowDown />
                              </div>
                              <select name="" id="" className="bg-bg shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-full cursor-pointer">
                                <option defaultValue={'Skin color'} className="bg-bg py-2 px-4">Default camera</option>
                              </select>
                            </div>
                            <p className="font-poppins font-medium text-purple pt-4">Camera position:</p>
                            <div className="flex gap-4 ">
                              <div className="flex items-center gap-2">
                                <p>X:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.pos.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.pos.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.pos.z} />
                              </div>
                            </div>
                            <p className="font-poppins font-medium text-purple pt-4">Camera look at:</p>
                            <div className="flex gap-4 ">
                              <div className="flex items-center gap-2">
                                <p>X:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.lookAt.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.lookAt.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-hard px-4 py-2 my-2 min-h-[48px] w-20 rounded-full text-center bg-bg" defaultValue={data.config.defCam.lookAt.z} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        })
      }
    }
  }

  function renderDbTable() {
    return (
      <>
        {
          dbData && dbData?.length > 0 ?
            <>
              <div className="flex flex-wrap gap-6">
                {
                  renderInfo()
                }
              </div>
            </>
            : <AGText type="th2" side="center">No data to show</AGText>
        }
      </>
    );
  }

  return (
    <>
      <div>
        <h1 className="font-humane text-9xl text-gray-normal uppercase">{campaign}</h1>
        <div className="flex">
          {renderButtonOptions()}
          <div className="order-2">
            <AGButton nm onClickEvent={() => changeComponent(AdminComponents.AssetAdd)}>
              <div className={`flex items-center gap-2 p-2 font-poppins text-blue`}>
                <IoMdAddCircleOutline className="text-2xl" />
                <p>Add Element</p>
              </div>
            </AGButton>
          </div>
        </div>
        <div className="pt-10">
          {renderDbTable()}
        </div>
      </div>
    </>
  );
}