import {Component} from "react";
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

interface AssetListState {
  dbLocation: FirestoreLocation;
  dbHeaders?: string[],
  dbData?: (FeatureInterface | AccessoryInterface | AnimationInterface)[],
}

export default class AssetList extends Component<AssetListProps, AssetListState> {
  locationOptions: string[];
  
  constructor(props: AssetListProps) {
    super(props);
    this.state = {
      dbLocation: FirestoreLocation.Features,
    };
    
    this.locationOptions = Object.keys(FirestoreLocation);
  }

  async componentDidMount() {
    await this.getDbInfo();
  }

  async getDbInfo(location: FirestoreLocation = this.state.dbLocation) {
    const data = await GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(location, this.props.campaign);
    
    this.setState({
      dbData: data,
      dbHeaders: data.length > 0 ? Object.keys(data[0]).sort((a, b) => a.localeCompare(b)) : [],
    });
  }

  render() {
    const {dbLocation} = this.state;

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
                        onChange={e => void this.changeDbLocation(e.target.value)}>
                  {this.renderLocationOptions()}
                </select>
              </div>
              <div className="flex">
                <AGButton type="alert" onClickEvent={() => this.props.changeComponent(AdminComponents.AssetAdd)}>Go to Add</AGButton>
              </div>
            </div>

            {this.renderDbTable()}

          </div>
        </div>
      </>
    );
  }

  async changeDbLocation(newLocation: string) {
    this.setState({
      dbLocation: newLocation as FirestoreLocation
    });
    await this.getDbInfo(newLocation as FirestoreLocation);
  }

  renderLocationOptions() {
    return this.locationOptions.map(x => {
      const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
      return <option value={val} key={x}>{x}</option>
    });
  }

  renderDbTable() {
    const { dbData } = this.state;
    return (
      <>
        {
          dbData && dbData?.length > 0 ?
          <div className="w-full overflow-x-auto border-2 border-slate-600">
            <table className="border-2">
              <thead>
              <tr>
                {this.renderHeaders()}
              </tr>
              </thead>
              <tbody>
              {this.renderInfo()}
              </tbody>
            </table>
          </div>
            : <AGText type="th2" side="center">No data to show</AGText>
        }
      </>
    );
  }

  renderHeaders() {
    if (!this.state.dbHeaders)
      return;

    return (
      <>
        <th className="px-1 min-w-fit max-w-md capitalize">Actions</th>
        {this.state.dbHeaders.map(x => {
          return <th className="px-1 min-w-fit max-w-md capitalize border-l-2 border-yellow-400" key={x}>{x}</th>
        })}
      </>
    )
  }

  renderInfo() {
    if (this.state.dbData && this.state.dbHeaders) {
      return this.state.dbData.map(d => {
        let acc = 0;
        return (
          <tr key={d['id']}>
            <td className="px-1 border-t-2 border-yellow-400 flex justify-evenly">
              <a onClick={() => this.props.changeComponent(AdminComponents.AssetModify, {docLocation: `${this.state.dbLocation}/${d.id}`})}>🎏</a>
              {this.state.dbLocation !== FirestoreLocation.Parameters ?
                <a className="hover:cursor-pointer" title="delete" onClick={() => void this.deleteDoc(d.id)}>👋</a> : ''
              }
            </td>
            {
              this.state.dbHeaders &&
              this.state.dbHeaders.map(h => {
                acc++;
                const key = h as keyof typeof d;
                const show = typeof (d[key]) === 'object' ? JSON.stringify(d[key]) : d[key];
                return <td className="px-1 min-w-fit max-w-md truncate border-l-2 border-t-2 border-yellow-400"
                           title={show} key={`${d.id}_${acc}`}>{show}</td>
              })
            }
          </tr>
        )
      });
    }
  }

  async deleteDoc(docId: string) {
    const result = await DeleteDoc(this.state.dbLocation, docId);
    alert(`Doc "${result}" has been deleted.`);
    await this.getDbInfo();
  }
}