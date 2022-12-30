import {useEffect, useRef, useState} from "react";
import {InsertDoc, UpdateDoc, UploadFile} from "../../../utils/firebase.util";
import {FirestoreLocation, StorageLocation} from "../../../enums/firebase.enum";
import AGButton from "../../../components/common/ag-button.component";
import {AssetInterface} from "../../../interfaces/api.interface";
import {BasicData, ChangeComponentFunction} from "../../../interfaces/common.interface";
import {AdminComponents, CampaignParameterName, Module} from "../../../enums/common.enum";
import {LogError} from "../../../utils/common.util";
import AGText from "../../common/ag-text.component";
import {SessionCampaignParameter} from "../../../utils/common/session.util";

interface AssetAddProps {
  campaign?: string;
  changeComponent: ChangeComponentFunction;
}

export default function AssetAdd({campaign, changeComponent}: AssetAddProps) {
  const [message, setMessage] = useState<string>();
  const [jsonData, setJsonData] = useState<string>('');
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Features);
  const [typeOptions, setTypeOptions] = useState<BasicData[]>([]);
  const [formData, setFormData] = useState<Partial<AssetInterface>>({});
  const [selectedStorage, setSelectedStorage] = useState<StorageLocation>(StorageLocation.AvatarBase);
  const [animation, setAnimation] = useState<boolean>();

  const fileToUpload = useRef<HTMLInputElement>(null);
  const thumbToUpload = useRef<HTMLInputElement>(null);
  const loneFile = useRef<HTMLInputElement>(null);
  
  const loneFileOptions: string[] = Object.keys(StorageLocation);
  const locationOptions: string[] = Object.keys(FirestoreLocation);
  
  useEffect(() => {
    const componentDidMount = async () => {
      await getTypeOptionsByCampaign();
    };
    
    componentDidMount()
      .catch(e => console.error(e));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    (async () => {
      await getTypeOptionsByCampaign();
    })().catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, dbLocation])

  async function getTypeOptionsByCampaign(leCampaign: string | undefined = campaign) {
    if (animation) return;
    if (leCampaign == undefined) {
      await LogError(Module.AssetAdd, "Missing campaign");
      return setMessage("Missing campaign!");
    }
    
    const parameter = parameterToFind();
    const result = await SessionCampaignParameter(leCampaign, parameter);
    setTypeOptions(result ?? []);
  }

  function renderTypeOptions() {
    return typeOptions == undefined ? <></> :
      typeOptions.map(x => {
        return <option value={x.id} key={x.id}>{x.id}</option>
      });
  }

  function renderLocationOptions() {
    return locationOptions.map(x => {
      const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
      return <option value={val} key={x}>{x}</option>
    });
  }

  function renderFileStorageOptions() {
    return loneFileOptions.map(x => {
      const val = StorageLocation[x as keyof typeof StorageLocation];
      return <option value={val} key={x}>{x}</option>
    });
  }

  function renderUploadType() {
    switch (dbLocation) {
      case FirestoreLocation.Animations:
      case FirestoreLocation.Accessories:
      case FirestoreLocation.Features:
        return renderFeatureForm();
      case FirestoreLocation.Parameters:
        return renderParameterForm();
    }
  }

  function renderFeatureForm() {
    return (
      <>
        <div className="mx-2 my-2 border-slate-600 border-2 rounded">
          <form>
            <h2 className="font-bold ml-5 mb-2"><span>😎</span>Form</h2>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Name:</p>
              <input className="w-52 border-slate-600 border-2 rounded px-1" type="text" required
                     value={formData.name ?? ''}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}/>
            </div>
            {!animation &&
                <div className="flex my-2">
                    <p className="mx-2 w-20 text-right">Type:</p>
                    <select className="w-52 rounded border-2 border-slate-600" required
                            value={formData.type ?? ''}
                            onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value=''>Select...</option>
                      {renderTypeOptions()}
                    </select>
                </div>}

            {!animation &&
                <div className="flex my-2">
                    <p className="mx-2 w-20 text-right my-2">Thumb:</p>
                    <input className="ml-2 my-2" type="file" accept=".jpg,.png" ref={thumbToUpload} required/>
                </div>}

            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">File:</p>
              <input className="ml-2 my-2" type="file" accept=".glb" ref={fileToUpload} required/>
            </div>

          </form>
        </div>
        <AGButton type='secondary' onClickEvent={() => void insertDBForm()}>Insert form</AGButton>
      </>
    );
  }

  function renderParameterForm() {
    return (
      <>
        <p><span>👯‍♀️</span>Insert new parameter on textfield (as json object) and it will join the parameters</p>
      </>
    );
  }

  async function insertDB(_jsonData: string | undefined = jsonData) {
    if (!(dbLocation && _jsonData)) return LogError(Module.AssetAdd, "Missing Data/Location to save new asset!");
    
    if (dbLocation !== FirestoreLocation.Parameters) {
      await InsertDoc(_jsonData, dbLocation, campaign);
      alert('Done inserting');
    } else {
      await UpdateDoc(_jsonData, dbLocation, campaign);
      alert('Done updating');
    }
  }

  function uploadTo(location: FirestoreLocation | undefined = dbLocation) {
    switch (location) {
      case FirestoreLocation.Features:
        return StorageLocation.Feature;
      case FirestoreLocation.Accessories:
        return StorageLocation.Accessory;
      case FirestoreLocation.Animations:
        return StorageLocation.Animation;
      default:
        return StorageLocation.Missing;
    }
  }

  function parameterToFind() {
    switch (dbLocation) {
      case FirestoreLocation.Features:
        return CampaignParameterName.Features;
      case FirestoreLocation.Accessories:
        return CampaignParameterName.Accessories;
      default:
        return CampaignParameterName.Missing;
    }
  }

  async function insertDBForm() {
    if (!formData) return LogError(Module.AssetAdd, "Missing Form Data!");
    if (!(fileToUpload.current && fileToUpload.current.files)) return LogError(Module.AssetAdd, "Missing file to upload");
    
    const uploadFileTo = uploadTo();
    const leFile = fileToUpload.current.files.item(0);
    const leThumb = thumbToUpload.current?.files?.item(0);

    if(leThumb != undefined)
      formData.thumb = await UploadFile(leThumb, StorageLocation.Thumbnail, undefined, campaign);
    
    formData.path = await UploadFile(leFile, uploadFileTo, formData.type, campaign);

    await insertDB(JSON.stringify(formData));
  }

  async function insertFile() {
    if (!(loneFile.current  && loneFile.current.files)) return alert("Missing file to upload");
    const realFile = loneFile.current.files.item(0);
    
    const newPath = await UploadFile(realFile, selectedStorage, undefined, campaign);
    console.log(newPath);
    alert("File uploaded");
  }

  return (
    <div className='flex justify-center'>
      <div className='w-2/3'>
        {message != undefined ? <AGText type="text" mark='😡'>{message}</AGText> : ''}
        <h1 className="ml-5 my-2 font-bold">Insert Into DB</h1>
        <div className="flex justify-between">
          <div className="flex my-2">
            <p className="mx-2">Db location:</p>
            <select className="w-52 rounded border-2 border-slate-600" required
                    value={dbLocation}
                    onChange={e => {
                      setDbLocation(e.target.value as FirestoreLocation);
                      setAnimation(e.target.value === FirestoreLocation.Animations);
                    }}>
              {renderLocationOptions()}
            </select>
          </div>
          <div className="flex">
            <AGButton type="alert" onClickEvent={() => changeComponent(AdminComponents.AssetList)}>
              Go to List
            </AGButton>
          </div>
        </div>

        {renderUploadType()}

        <form>
          <div className='mx-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded" rows={5}
                        value={jsonData} onChange={(e) => setJsonData(e.target.value)}/>
          </div>
          <AGButton type='primary' onClickEvent={() => void insertDB()}>Insert json</AGButton>
        </form>

        <form>
          <div className="mx-2 my-2 border-slate-600 border-2 rounded">
            <h2 className="font-bold ml-5 mb-2"><span>🙋‍♂️</span>Lone File</h2>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Type:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={selectedStorage}
                      onChange={e => setSelectedStorage(e.target.value as StorageLocation)}>
                <option value=''>Select...</option>
                {renderFileStorageOptions()}
              </select>
            </div>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">File:</p>
              <input className="ml-2 my-2" type="file" ref={loneFile} required/>
            </div>
          </div>
          <AGButton type='alert' onClickEvent={() => void insertFile()}>Insert File</AGButton>
        </form>
      </div>
    </div>
  );
}