import {Component} from "react";
import {FirestoreLocation} from "../../../enums/firebase.enum";
import {DeleteDoc, GetInfoDB, HandleNotLoggedIn, LogOut} from "../../../utils/firebase.util";
import Link from "next/link";
import AGButton from "../../../components/common/ag-button.component";
import Head from "next/head";
import AGText from "../../../components/common/ag-text.component";

interface AssetListProps {
}

interface AssetListState {
  dbLocation: FirestoreLocation;
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
      dbLocation: FirestoreLocation.Features,
      locationOptions: Object.values(FirestoreLocation),
    };
  }

  async componentDidMount() {
    await HandleNotLoggedIn();
    
    await this.getDbInfo();
  }

  async getDbInfo(location: FirestoreLocation = this.state.dbLocation) {
    const data = await GetInfoDB<any>(location, 'decentraland');
    
    this.setState({
      dbData: data,
      dbHeaders: data.length > 0 ? Object.keys(data[0]).sort((a, b) => a.localeCompare(b)) : [],
    });
  }

  render() {
    const {dbLocation} = this.state;

    return (
      <>
        <Head>
          <title>Asset List</title>
        </Head>
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
                <AGButton type="alert">
                  <Link href="add">Go to Add</Link>
                </AGButton>
                <AGButton type="danger" onClickEvent={() => LogOut()}>Log Out</AGButton>
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
    return this.state.locationOptions.map(x => {
      return <option value={x} key={x}>{x}</option>
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
              <Link href={{pathname: 'update', query: {docLocation: `${this.state.dbLocation}/${d['id']}`}}}>🎏</Link>
              {this.state.dbLocation !== FirestoreLocation.Parameters ?
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
    const result = await DeleteDoc(this.state.dbLocation, docId);
    alert(`Doc "${result}" has been deleted.`);
    await this.getDbInfo();
  }
}