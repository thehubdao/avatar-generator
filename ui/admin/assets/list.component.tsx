import { useCallback, useEffect, useState } from "react";
import Image from 'next/image';
import { FirestoreLocation } from "../../../enums/firebase.enum";
import { DeleteDoc, GetFileUrl, GetInfoDB } from "../../../utils/firebase.util";
import AGButton from "../../common/ag-button.component";
import AGText from "../../common/ag-text.component";
import { AdminComponents } from "../../../enums/common.enum";
import { ChangeComponentFunction } from "../../../interfaces/common.interface";
import { AccessoryInterface, AnimationInterface, AssetInterface, FeatureInterface } from "../../../interfaces/api.interface";
import { CampaignParameters } from '../../../interfaces/common.interface'
import {
  AccessoryInterfaceProps,
  AnimationInterfaceProps,
  CampaignInterfaceProps,
  EnvironmentInterfaceProps,
  FeatureInterfaceProps
} from "../../../constants/obj-props.constant";
import { AssetType } from "../../../types/asset.type";

// Icons
import { AiOutlineLink, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlineHome, AiOutlineCloudDownload, AiOutlineCloudUpload, AiOutlinePauseCircle, AiOutlineVideoCamera, AiOutlineEyeInvisible, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { IoMdAddCircleOutline } from 'react-icons/io';
import { IoImageOutline, IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineColorLens } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';
import { BsLightbulb } from "react-icons/bs";

interface AssetListProps {
  campaign?: string;
  changeComponent: ChangeComponentFunction;
}

interface ThumbnailProps {
  option: AssetType;
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

function GetOptionThumbnail({ option }: ThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const newImage = await GetFileUrl(option.thumb);
      setImageUrl(newImage ?? undefined);
    })().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option])

  return (
    <>
      {imageUrl == undefined ?
        <div className="relative w-2/4 h-2/4">
          <Image src={'/resources/icons/features/default.svg'} fill sizes={'132px'} alt={option.name} />
        </div>
        :
        <Image placeholder="blur" blurDataURL={imageUrl} src={imageUrl} fill sizes={'132px'} alt={option.name} />
      }
    </>
  );
}

function ColorPicker({ color, id, specificPalette, colorList }: ColorPickerProps) {
  const [defaultColor, setDefaultColor] = useState<string>(color);
  const [paletteSelector, setPaletteSelector] = useState<boolean>(specificPalette);
  const [paletteLength, setPaletteLength] = useState<number>(colorList?.length || 0);
  const [paletteColors, setPaletteColors] = useState<string[]>(colorList || []);
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

export default function AssetList({ campaign, changeComponent }: AssetListProps) {
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Parameters);
  const [dbData, setDbData] = useState<AssetType[]>();
  const [dbHeaders, setDbHeaders] = useState<string[]>();
  const [openConfig, setOpenConfig] = useState<boolean>(false);
  const [configOption, setConfigOption] = useState<string>('base');

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
      <div className="rounded-2xl h-[80vh] w-full flex flex-col justify-center items-center shadow-flat-soft hover:shadow-flat-hard overflow-hidden">
        <div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-end">
        </div>
      </div>
    )
  }

  function AssetCard({ dataF }: { dataF: AssetType }) {
    const [data, setData] = useState<AssetType>(dataF);
    const [onDelete, setOnDelete] = useState<boolean>(false);
    const [onEdit, setOnEdit] = useState<boolean>(false);

    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log("dataF: ", dataF);
      setData(dataF);
    }, [dataF]);

    return (
      <div className="relative w-56 p-4 shadow-flat-soft overflow-hidden bg-bg rounded-lg hover:shadow-flat-hard transition-all duration-300 cursor-pointer group">
        {/* DATA */}
        <div className="pb-2">
          {data.name && <p className="font-poppins font-medium text-xl text-gray-normal uppercase truncate max-w-full">{data.name}</p>}
        </div>
        {/* THUMBNAIL */}
        <div className="relative w-[192px] h-[192px] flex justify-center items-center bg-[#3d3d3d]">
          <GetOptionThumbnail option={data} />
        </div>
        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center text-xl absolute bottom-0 left-0 w-56 p-2 min-h-[64px] bg-bg opacity-0 group-hover:opacity-100 animation-opacity duration-300">
          {
            onDelete ?
              <div className="flex items-center justify-between w-full">
                <p className="pl-2 text-sm">Are you sure?</p>
                <div className="flex">
                  <AGButton nm fit onClickEvent={() => void deleteDoc(data.id)}>
                    <AiOutlineCheckCircle />
                  </AGButton>
                  <AGButton nm fit onClickEvent={() => setOnDelete(false)}>
                    <AiOutlineCloseCircle />
                  </AGButton>
                </div>
              </div>
              : onEdit ?
                <>
                  <div className="w-full">
                    <label htmlFor="" className="text-sm">Name: </label>
                    <input type="text" className="shadow-inset-soft hover:shadow-inset-medium px-2 py-1 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg" min='5' max='20' defaultValue={data.name} />
                    <div className="flex justify-between">
                      <div className="flex">
                        <AGButton nm fit onClickEvent={() => {
                          setOnEdit(false);
                        }}>
                          <AiOutlineCloudUpload />
                        </AGButton>
                        <AGButton nm fit onClickEvent={() => {
                          setOnEdit(false);
                        }}>
                          <IoImageOutline />
                        </AGButton>
                      </div>
                      <div className="flex">
                        <AGButton nm fit onClickEvent={() => setOnEdit(false)}>
                          <AiOutlineCloseCircle />
                        </AGButton>
                        <AGButton nm fit onClickEvent={() => changeComponent(AdminComponents.AssetModify, {
                          docLocation: `${dbLocation}${data.id != undefined ? '/' + data.id : ''}`
                        })}>
                          <AiOutlineCheckCircle />
                        </AGButton>
                      </div>
                    </div>
                  </div>
                </>
                :
                <>
                  <div className="flex">
                    <AGButton nm fit onClickEvent={() => copyToClipboard(data.path)}>
                      <AiOutlineLink />
                    </AGButton>
                  </div>
                  <div className="flex justify-end items-center">
                    <AGButton nm fit onClickEvent={() => setOnEdit(true)}>
                      <AiOutlineEdit />
                    </AGButton>
                    {dbLocation !== FirestoreLocation.Parameters &&
                      <AGButton nm fit onClickEvent={() => setOnDelete(true)}>
                        <AiOutlineDelete />
                      </AGButton>
                    }
                  </div>
                </>
          }
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

    if (dbData && dbHeaders) {
      let id = 0;
      // eslint-disable-next-line no-console
      console.log("data: ", dbData);
      if (dbLocation !== '/') {
        return dbData.map((datum) => {
          id += 1;
          return (
            <div key={id}>
              <AssetCard dataF={datum} />
            </div>
            // <div key={id} className="relative w-56 p-4 shadow-flat-soft bg-bg rounded-lg hover:shadow-flat-hard transition-all duration-300 cursor-pointer group">
            //   {/* DATA */}
            //   <div className="pb-2">
            //     {datum.name && <p className="font-poppins font-medium text-xl text-gray-normal uppercase truncate max-w-full">{datum.name}</p>}
            //     {datum.type && <p className="text-sm truncate"><span className="font-medium">Type:</span> {datum.type}</p>}
            //   </div>
            //   {/* THUMBNAIL */}
            //   <div>
            //     <Thumbnail opt={datum} />
            //   </div>
            //   {/* ACTION BUTTONS */}
            //   <div className="flex justify-between items-center text-xl absolute bottom-0 left-0 w-56 p-4 bg-bg opacity-0 group-hover:opacity-100 animation-opacity duration-300">
            //     {
            //       true ?
            //         <>
            //           <p className="text-sm">Are you sure?</p>
            //           <div className="flex gap-2">
            //             <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-green-500 transition-all duration-300"
            //               title="Edit"
            //               onClick={() => changeComponent(AdminComponents.AssetModify, {
            //                 docLocation: `${dbLocation}${datum.id != undefined ? '/' + datum.id : ''}`
            //               })}>
            //               <AiOutlineCheckCircle />
            //             </button>
            //             <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-red transition-all duration-300"
            //               title="Edit"
            //               onClick={() => changeComponent(AdminComponents.AssetModify, {
            //                 docLocation: `${dbLocation}${datum.id != undefined ? '/' + datum.id : ''}`
            //               })}>
            //               <AiOutlineCloseCircle />
            //             </button>
            //           </div>
            //         </>
            //         :
            //         <>
            //           <div className="flex gap-2">
            //             <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-blue transition-all duration-300"
            //               title={datum.path}
            //               onClick={() => { copyToClipboard(datum.path) }}>
            //               <AiOutlineLink />
            //             </button>
            //             {/* <div className="shadow-inset-hard p-2 rounded-full text-gray-light cursor-not-allowed hidden">
            //                 <AiOutlineEye />
            //               </div> */}
            //           </div>
            //           <div className="flex justify-end items-center gap-2">
            //             <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-purple transition-all duration-300"
            //               title="Edit"
            //               onClick={() => changeComponent(AdminComponents.AssetModify, {
            //                 docLocation: `${dbLocation}${datum.id != undefined ? '/' + datum.id : ''}`
            //               })}>
            //               <AiOutlineEdit />
            //             </button>
            //             {dbLocation !== FirestoreLocation.Parameters &&
            //               <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-orange transition-all duration-300"
            //                 title="Delete"
            //                 onClick={
            //                   () => void deleteDoc(datum.id)
            //                 }>
            //                 <AiOutlineDelete />
            //               </button>
            //             }
            //           </div>
            //         </>
            //     }
            //   </div>
            // </div>
          )
        });
      } else if (dbData[0].owner) {
        return dbData.map(data => {
          id += 1;
          return (
            <>
              {/* AVATAR SINGLE VIEW */}
              <Card />
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
                                  <option defaultValue={data.config.defAnimation} className="bg-bg py-2 px-4">{data.config.defAnimation}</option>
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
                              <ColorPicker color="#ff0000" id="skin" specificPalette colorList={colorArr} />
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
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.z} />
                              </div>
                            </div>
                            <p className="font-poppins font-medium text-purple pt-4 px-2">Camera look at:</p>
                            <div className="flex gap-4 px-2">
                              <div className="flex items-center gap-2">
                                <p>X:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.z} />
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
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.pos.z} />
                              </div>
                            </div>
                            <p className="font-poppins font-medium text-purple pt-4 px-2">Light look at:</p>
                            <div className="flex gap-4 px-2">
                              <div className="flex items-center gap-2">
                                <p>X:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.x} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Y:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.y} />
                              </div>
                              <div className="flex items-center gap-2">
                                <p>Z:</p>
                                <input type="number" className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg" defaultValue={data.config.defCam.lookAt.z} />
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
                    <div onClick={e => setOpenConfig(!openConfig)} className="w-10 h-10 text-2xl text-purple bg-white rounded-full flex justify-center items-center cursor-pointer">
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
              <div className="relative w-full flex flex-wrap gap-6">
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