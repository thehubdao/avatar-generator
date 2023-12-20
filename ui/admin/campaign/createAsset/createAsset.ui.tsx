import { MdKeyboardArrowDown } from "react-icons/md";
import { CampaignParameters, FeatureBasic } from "../../../../interfaces/common.interface";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { useEffect, useRef, useState } from "react";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { setLocation, setType, setName, setReady } from "../../../../store/addAssetSlice";
import AGButton from "../../../common/ag-button.component";
import CreateAsset from "../../../../components/admin/assets/createAsset.component";
import { AiOutlineCheckCircle, AiOutlineCloudUpload } from "react-icons/ai";
import { IoImageOutline } from "react-icons/io5";

export default function AddAssetUI() {
  const currentCampaignParams = useAppSelector(state => state.currentCampaign.parameters);
  const assetFile = useRef<HTMLInputElement>(null);
  const thumbFile = useRef<HTMLInputElement>(null);
  const [typeOptions, setTypeOptions] = useState<FeatureBasic[]>(currentCampaignParams.features as FeatureBasic[]);
  const locationOptions: string[] = Object.keys(FirestoreLocation);
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Features);
  const [assetType, setAssetType] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [hasAssetFile, setHasAssetFile] = useState<boolean>(false);
  const [hasThumbFile, setHasThumbFile] = useState<boolean>(false);
  const [shouldShowCreateBtn, setShouldShowCreateBtn] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLocation(dbLocation));
    dispatch(setType(''));
    setAssetType('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbLocation])

  useEffect(() => {
    dispatch(setType(assetType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType])

  useEffect(() => {
    dispatch(setName(assetName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetName])

  useEffect(() => {
    const willNeedStorage: boolean = dbLocation === FirestoreLocation.Features || dbLocation === FirestoreLocation.Accessories;
    if (willNeedStorage) {
      if (hasAssetFile && hasThumbFile && assetType !== '' && assetName !== '') {
        setShouldShowCreateBtn(true);
      } else {
        setShouldShowCreateBtn(false);
      }
    } else if (hasAssetFile && hasThumbFile && assetName !== '') {
      setShouldShowCreateBtn(true);
    } else {
      setShouldShowCreateBtn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAssetFile, hasThumbFile, assetType, assetName, dbLocation])

  function checkAssetFile() {
    const fileLength = assetFile.current?.files?.length;
    if (!fileLength || fileLength < 1) {
      setHasAssetFile(false);
    } else {
      setHasAssetFile(true);
    }
  }

  function checkThumbFile() {
    const fileLength = thumbFile.current?.files?.length;
    if (!fileLength || fileLength < 1) {
      setHasThumbFile(false);
    } else {
      setHasThumbFile(true);
    }
  }

  return (
    <>
      <div>
        <h1 className="font-humane text-9xl text-gray-normal">CREATE ASSET:</h1>
        <div>
          <p>You can create new
            <span className="text-orange font-bold"> FEATURES</span>,
            <span className="text-orange font-bold"> ACCESSORIES</span>,
            <span className="text-blue font-bold"> ANIMATIONS</span> and
            <span className="text-blue font-bold"> ENVIRONMENTS</span> options.<br />
            Select the type you want to create:
          </p>
        </div>
        <div className="w-2/4 m-auto">
          <div className="flex gap-4">
            <div className="relative mt-5 w-full cursor-pointer">
              <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                <MdKeyboardArrowDown />
              </div>
              <select name="" id="" className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer" value={dbLocation} onChange={e => {
                if (currentCampaignParams) {
                  const specificParameters: FeatureBasic[] = currentCampaignParams[e.target.value as keyof CampaignParameters] as FeatureBasic[];
                  setTypeOptions(specificParameters);
                }
                setDbLocation(e.target.value as FirestoreLocation);
              }}>
                {locationOptions.map(x => {
                  const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
                  return <option value={val} key={x}>{x}</option>
                })}
              </select>
            </div>
            <div className="relative mt-5 w-full cursor-pointer">
              <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
                <MdKeyboardArrowDown />
              </div>
              <select
                name=""
                id=""
                className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer"
                value={assetType}
                onChange={e => { setAssetType(e.target.value) }}
              >
                <option value=''>Select...</option>
                {
                  typeOptions &&
                  typeOptions.map((x: FeatureBasic, index: number) => {
                    return <option value={x.displayName} key={index}>{x.displayName}</option>
                  })
                }
              </select>
            </div>
          </div>
          <div className="w-full">
            <p className="font-poppins font-medium text-purple mt-4">Asset name:</p>
            <input type="text" className="shadow-inset-soft hover:shadow-inset-medium px-4 py-2 min-h-[48px] rounded-lg bg-bg w-full" onChange={e => {
              setAssetName(e.target.value)
            }} />
          </div>
          <div className="flex gap-4 pt-4">
            <label className="relative mt-5 bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[40px] py-2 px-4 rounded-lg cursor-pointer" htmlFor="createNewGLBAsset">
              <p className="text-start">File</p>
              {hasAssetFile
                ? <AiOutlineCheckCircle className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none text-green-600" />
                : <AiOutlineCloudUpload className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none" />}
              <input
                type="file"
                id="createNewGLBAsset"
                name="createNewGLBAsset"
                className="hidden"
                accept=".glb"
                ref={assetFile}
                onChange={checkAssetFile}
              />
              {hasAssetFile && <div className="absolute w-11/12 flex gap-2 mt-3 whitespace-nowrap">
                <p>File updated:</p>
                <p className="truncate">{assetFile.current?.files?.item(0)?.name}</p>
              </div>}
            </label>
            <label className="relative mt-5 bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[40px] py-2 px-4 rounded-lg cursor-pointer" htmlFor="createNewImageAsset">
              <p className="text-start">Thumbnail</p>
              {hasThumbFile
                ? <AiOutlineCheckCircle className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none text-green-600" />
                : <IoImageOutline className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none" />}
              <input type="file" id="createNewImageAsset" name="createNewImageAsset" className="hidden" accept="image/png, image/jpeg" ref={thumbFile} onChange={checkThumbFile} />
              {hasThumbFile && <div className="absolute w-11/12 flex gap-2 mt-3 whitespace-nowrap">
                <p>File updated:</p>
                <p className="truncate">{thumbFile.current?.files?.item(0)?.name}</p>
              </div>}
            </label>
          </div>
          {
            shouldShowCreateBtn &&
            <div className="w-2/4 m-auto pt-12">
              <AGButton nm full onClickEvent={() => {
                dispatch(setReady(true));
              }}>
                <p className="p-1">Create</p>
              </AGButton>
            </div>
          }

        </div>
      </div>
      <CreateAsset objectFile={assetFile.current?.files?.item(0)} thumbnailFile={thumbFile.current?.files?.item(0)} />
    </>
  )
}