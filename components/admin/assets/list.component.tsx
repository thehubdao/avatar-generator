import { useCallback, useEffect, useState } from "react";
import Image from 'next/image';
import { FirestoreLocation } from "../../../enums/firebase.enum";
import { DeleteDoc, GetFileUrl, GetInfoDB } from "../../../utils/firebase.util";
import AGButton from "../../../components/common/ag-button.component";
import AGText from "../../../components/common/ag-text.component";
import { AdminComponents } from "../../../enums/common.enum";
import { ChangeComponentFunction } from "../../../interfaces/common.interface";
import { AccessoryInterface, AnimationInterface, FeatureInterface } from "../../../interfaces/api.interface";
import {
  AccessoryInterfaceProps,
  AnimationInterfaceProps,
  CampaignInterfaceProps,
  FeatureInterfaceProps
} from "../../../constants/obj-props.constant";

// Icons
import { AiOutlineLink, AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

interface AssetListProps {
  campaign?: string;
  changeComponent: ChangeComponentFunction;
}

interface ThumbnailProps {
  opt: FeatureInterface | AccessoryInterface | AnimationInterface;
}

function Thumbnail({opt}: ThumbnailProps) {
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
          <Image src={'/resources/images/image.png'} width={192} height={192} alt={opt.name}/>
        </div> :
        <div className='w-[192px] h-[192px] rounded-md overflow-hidden flex justify-center items-center bg-gray-700'>
          <Image placeholder="blur" blurDataURL="/resources/images/image.png"
                 src={imageUrl} width={192} height={192} alt={opt.name}/>
        </div>
      }
    </>
  );
}

export default function AssetList({ campaign, changeComponent }: AssetListProps) {
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Parameters);
  const [dbData, setDbData] = useState<(FeatureInterface | AccessoryInterface | AnimationInterface)[]>();
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
    }
  }, [dbLocation]);

  const getDbInfo = useCallback(async (location: FirestoreLocation = dbLocation) => {
    // const data = await SessionDBInfo(location, campaign, forceUpdate);
    const data = await GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(location, campaign);
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
      return <div className={`${x === 'Parameters' ? 'order-1':''} inline`} key={x}>
        <AGButton nm onClickEvent={() => void changeDbLocation(val)}>
          <div className={`flex items-center gap-2 p-2`}>
            <div className={`w-2 h-2 rounded-full ${dbLocation == val ? ' bg-green-400' : 'bg-gray-light'}`}></div>
            <div className={`uppercase ${dbLocation == val ? ' font-medium' : ''}`}>
              {x}
            </div>
          </div>
        </AGButton>
      </div>
    });
  }

  async function deleteDoc(docId: string) {
    const result = await DeleteDoc(dbLocation, docId);
    alert(`Doc "${result}" has been deleted.`);
    await getDbInfo();
  }

  function copyToClipboard (text: string) {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }

  function renderInfo() {
    if (dbData && dbHeaders) {
      // eslint-disable-next-line no-console
      console.log("dbData: ", dbData)
      return dbData.map(datum => {
        return (
          <div key={datum['id']} className="w-56 p-4 shadow-flat-soft m-4 bg-light hover:shadow-flat-hard transition-all duration-300">
            {/* DATA */}
            <div className="text-left">
              {datum.name && <p className="text-xl font-medium uppercase overflow-hidden text-ellipsis whitespace-nowrap shadow-inset-medium max-w-full py-1 px-3 rounded-md">{datum.name}</p>}
              {datum.type && <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap my-2"><span className="font-medium">Type:</span> {datum.type}</p>}
            </div>
            {/* THUMBNAIL */}
            <div>
              <Thumbnail opt={datum}/>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex justify-between text-xl pt-6">
              <div className="flex gap-2">
                <button className="shadow-inset-hard p-2 rounded-full hover:shadow-inset-soft hover:text-blue transition-all duration-300"
                title={datum.path}
                onClick={() => {copyToClipboard(datum.path)}}>
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
    }
  }

  function renderDbTable() {
    return (
      <>
        {
          dbData && dbData?.length > 0 ?
            <>
              <div className="flex flex-wrap justify-between">
                {
                  dbLocation === '/' ?
                  <div>parameters</div>
                  :
                  renderInfo()
                }
              </div>
              <div>{dbLocation}</div>
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
        </div>
        <div className="pt-10">
          {renderDbTable()}
        </div>
      </div>
    </>
  );
}