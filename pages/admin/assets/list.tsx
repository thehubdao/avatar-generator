import {Component} from "react";
import {FirestoreValues} from "../../../enums/firebase.enum";
import {FirebaseUtil} from "../../../utils/firebase.util";
import Link from "next/link";
import AGButton from "../../../components/ag-button.component";

interface AssetListProps {
}

interface AssetListState {
  dbLocation: FirestoreValues;
  locationOptions: string[],
  dbHeaders?: string[],
  dbData?: any[],
}

// Show info from database
// Delete entry on database (or add a new field for deleted entries) (new field needs to edit getParts as well)
export default class List extends Component<AssetListProps, AssetListState> {
  constructor(props: AssetListProps) {
    super(props);
    this.state = {
      dbLocation: FirestoreValues.Parts,
      locationOptions: Object.values(FirestoreValues),
    };
  }

  async componentDidMount() {
    await this.getDbInfo();
  }

  async getDbInfo(location: FirestoreValues = this.state.dbLocation) {
    const data = await FirebaseUtil.Instance().GetInfoDB<any>(location);
    this.setState({
      dbData: data,
      dbHeaders: data.length > 0 ? Object.keys(data[0]).sort((a, b) => a.localeCompare(b)) : [],
    });
  }

  render() {
    const {dbLocation} = this.state;

    return (
      <div className="flex justify-center">
        <div className="w-2/3">
          <h1 className="ml-5 my-2 font-bold"><span>😬</span>DB Info</h1>
          <div className="my-2 flex justify-between">
            <div className="flex my-2">
              <p className="mx-2">Db location:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={dbLocation}
                      onChange={e => this.changeDbLocation(e.target.value)}>
                {this.renderLocationOptions()}
              </select>
            </div>
            <div className="flex">
              <div className="mx-2 my-2 border-2 border-slate-600 rounded bg-amber-600">
                <Link href="add"><p className="mx-2 text-white hover:cursor-help">Go to Add</p></Link>
              </div>
              <AGButton type="danger" onClickEvent={() => FirebaseUtil.Instance().LogOut()}>Log Out</AGButton>
            </div>
          </div>

          {this.renderDbTable()}

        </div>
      </div>
    );
  }

  async changeDbLocation(newLocation: string) {
    this.setState({
      dbLocation: newLocation as FirestoreValues
    });
    await this.getDbInfo(newLocation as FirestoreValues);
  }

  renderLocationOptions() {
    return this.state.locationOptions.map(x => {
      return <option value={x} key={x}>{x}</option>
    });
  }

  renderDbTable() {
    return (
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
              <Link href={{pathname: 'update', query: {docLocation: `${this.state.dbLocation}/${d['id']}`}}}>🎏</Link>
              {this.state.dbLocation !== FirestoreValues.Parameters ?
                <a className="hover:cursor-pointer" title="delete" onClick={() => this.deleteDoc(d['id'])}>👋</a> : ''
              }
            </td>
            {
              this.state.dbHeaders!.map(h => {
                acc++;
                const show = typeof (d[h]) === 'object' ? JSON.stringify(d[h]) : d[h];
                return <td className="px-1 min-w-fit max-w-md truncate border-l-2 border-t-2 border-yellow-400"
                           title={show} key={d['id'] + '_' + acc}>{show}</td>
              })
            }
          </tr>
        )
      });
    }
  }

  async deleteDoc(docId: string) {
    const result = await FirebaseUtil.Instance().DeleteDoc(this.state.dbLocation, docId);
    alert(`Doc "${result}" has been deleted.`);
    await this.getDbInfo();
  }
}

