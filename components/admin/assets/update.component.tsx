import {useEffect, useState} from "react";
import {GetInfoDB, ReplaceDoc} from "../../../utils/firebase.util";
import AGButton from "../../../ui/common/ag-button.component";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../../interfaces/api.interface";
import {AdminComponents} from "../../../enums/common.enum";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";
import {FirestoreGlobalLocation} from "../../../enums/firebase.enum";
import AGText from "../../../ui/common/ag-text.component";
import {AddOrRemoveSlash} from "../../../utils/common.util";
import { modal } from "../../../utils/modal.util";

interface AssetUpdateProps {
  campaign?: string;
  docLocation?: string;
  changeComponent: ChangeComponentFunction;
}

export default function AssetUpdate({docLocation, campaign, changeComponent}: AssetUpdateProps) {
  const [doc, setDoc] = useState<string>('');
  const [jsonData, setJsonData] = useState<string>('');
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const componentDidMount = async () => {
      await initData();
    };

    componentDidMount()
      .catch(err => console.error(err));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initData() {
    if (!docLocation) return setMessage('Missing document information');

    let newDocLocation = campaign != undefined ?
      `${FirestoreGlobalLocation.Campaign}/${campaign}${AddOrRemoveSlash(docLocation)}` : 
      docLocation;

    if (docLocation.split('/').length % 2 !== 0) {
      newDocLocation = docLocation.slice(0, docLocation.lastIndexOf('/'));
    }

    const _docInfo = await GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(newDocLocation);
    const _jsonData = _docInfo.length > 0 ? formatJson(JSON.stringify(_docInfo[0])) : '';

    setDoc(newDocLocation);
    setJsonData(_jsonData);
  }

  function formatJson(jsonString: string) {
    let result = jsonString;
    result = result.replace('{', '{\n\t');
    result = result.replaceAll(',', ',\n\t');
    result = result.replaceAll(':', ': ');
    result = result.replace('}', '\n}');
    return result;
  }

  async function updateData() {
    if (docLocation == undefined) return modal('Missing document location to update!');

    await ReplaceDoc(doc, jsonData);
    modal(`Doc "${doc}" has been updated`);
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="w-2/3">
          {message != undefined ? <AGText type="text" mark='😡'>{message}</AGText> : ''}
          <h1 className="ml-5 font-bold my-2"><span>🤡</span>Update Doc</h1>
          <div className="flex justify-between my-2">
            <h2 className="mx-2">Doc path: <span className="font-bold">{docLocation}</span></h2>
            <AGButton type="alert" onClickEvent={() => changeComponent(AdminComponents.AssetList)}>Go to List</AGButton>
          </div>
          <form>
            <div className='mx-2 my-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded whitespace-pre-line"
                        rows={10} value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}/>
            </div>
            <AGButton type='primary' onClickEvent={() => void updateData()}>Update json</AGButton>
          </form>
        </div>
      </div>
    </>
  );
}