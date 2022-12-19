import {useEffect, useState} from "react";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {DeleteDoc, GetInfoDB} from "../../../utils/firebase.util";
import AGButton from "../../../components/common/ag-button.component";
import AGText from "../../../components/common/ag-text.component";
import {AdminComponents} from "../../../enums/common.enum";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../../interfaces/api.interface";

interface AssetListProps {
  campaign?: string;
  changeComponent: ChangeComponentFunction;
}

export default function AssetList({campaign, changeComponent}: AssetListProps) {
  const [dbLocation, setDbLocation] = useState<FirestoreLocation>(FirestoreLocation.Features);
  const [dbData, setDbData] = useState<(FeatureInterface | AccessoryInterface | AnimationInterface)[]>();
  const [dbHeaders, setDbHeaders] = useState<string[]>();

  const locationOptions: string[] = Object.keys(FirestoreLocation);

  useEffect(() => {
    const componentDidMount = async () => {
      await getDbInfo();
    };

    componentDidMount()
      .catch(err => console.error(err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: check if maybe there is a better way to ask for information, maybe a force sometimes, others just get the session info
  async function getDbInfo(location: FirestoreLocation = dbLocation) {
    const data = await GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(location, campaign);

    setDbData(data);
    setDbHeaders(data.length > 0 ? Object.keys(data[0]).sort((a, b) => a.localeCompare(b)) : []);
  }

  async function changeDbLocation(newLocation: string) {
    setDbLocation(newLocation as FirestoreLocation);
    await getDbInfo(newLocation as FirestoreLocation);
  }

  function renderLocationOptions() {
    return locationOptions.map(x => {
      const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
      return <option value={val} key={x}>{x}</option>
    });
  }

  function renderHeaders() {
    if (!dbHeaders)
      return;

    return (
      <>
        <th className="px-1 min-w-fit max-w-md capitalize">Actions</th>
        {dbHeaders.map(x => {
          return <th className="px-1 min-w-fit max-w-md capitalize border-l-2 border-yellow-400" key={x}>{x}</th>
        })}
      </>
    )
  }

  async function deleteDoc(docId: string) {
    const result = await DeleteDoc(dbLocation, docId);
    alert(`Doc "${result}" has been deleted.`);
    await getDbInfo();
  }

  function renderInfo() {
    if (dbData && dbHeaders) {
      return dbData.map(datum => {
        let acc = 0;
        return (
          <tr key={datum['id']}>
            <td className="px-1 border-t-2 border-yellow-400 flex justify-evenly hover:cursor-pointer">
              <a
                onClick={() => changeComponent(AdminComponents.AssetModify, {
                  docLocation: `${dbLocation}${datum.id != undefined ? '/' + datum.id : ''}`
                })}>🎏</a>
              {dbLocation !== FirestoreLocation.Parameters ?
                <a className="hover:cursor-pointer" title="delete" onClick={() => void deleteDoc(datum.id)}>👋</a> : ''
              }
            </td>
            {
              dbHeaders &&
              dbHeaders.map(header => {
                acc++;
                const key = header as keyof typeof datum;
                const show = typeof (datum[key]) === 'object' ? JSON.stringify(datum[key]) : datum[key];
                return <td className="px-1 min-w-fit max-w-md truncate border-l-2 border-t-2 border-yellow-400"
                           title={show} key={`${datum.id}_${acc}`}>{show}</td>
              })
            }
          </tr>
        )
      });
    }
  }

  function renderDbTable() {
    return (
      <>
        {
          dbData && dbData?.length > 0 ?
            <div className="w-full overflow-x-auto border-2 border-slate-600">
              <table className="border-2">
                <thead>
                <tr>
                  {renderHeaders()}
                </tr>
                </thead>
                <tbody>
                {renderInfo()}
                </tbody>
              </table>
            </div>
            : <AGText type="th2" side="center">No data to show</AGText>
        }
      </>
    );
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="w-2/3">
          <h1 className="ml-5 my-2 font-bold"><span>😬</span>DB Info</h1>
          <div className="my-2 flex justify-between">
            <div className="flex my-2">
              <p className="mx-2">Db location:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={dbLocation}
                      onChange={e => void changeDbLocation(e.target.value)}>
                {renderLocationOptions()}
              </select>
            </div>
            <div className="flex">
              <AGButton type="alert" onClickEvent={() => changeComponent(AdminComponents.AssetAdd)}>Go to Add</AGButton>
            </div>
          </div>

          {renderDbTable()}

        </div>
      </div>
    </>
  );
}