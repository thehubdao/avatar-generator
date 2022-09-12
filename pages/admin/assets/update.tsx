import {Component} from "react";
import {GetServerSideProps} from "next";
import {GetInfoDB, IsLogIn, UpdateDoc} from "../../../utils/firebase.util";
import AGButton from "../../../components/ag-button.component";
import Link from "next/link";
import {WithRouterProps} from "next/dist/client/with-router";
import {withRouter} from "next/router";

interface AssetUpdateProps extends WithRouterProps {
  docLocation?: string;
  docInfo?: string | null;
}

interface AssetUpdateState {
  jsonData?: string;
}

class Update extends Component<AssetUpdateProps, AssetUpdateState> {
  constructor(props: AssetUpdateProps) {
    super(props);
    this.state = {
      jsonData: props.docInfo === null ? undefined : this.formatJson(props.docInfo!),
    };

    IsLogIn()
      .then(res => {
        if(!res)
          this.props.router.push('/admin').then();
      });
  }

  formatJson(jsonString: string) {
    let result = jsonString;
    result = result.replace('{', '{\n\t');
    result = result.replaceAll(',', ',\n\t');
    result = result.replaceAll(':', ': ');
    result = result.replace('}', '\n}');
    return result;
  }

  render() {
    return (
      <div className="flex justify-center">
        <div className="w-2/3">
          <h1 className="ml-5 font-bold my-2"><span>🤡</span>Update Doc</h1>
          <div className="flex justify-between my-2">
            <h2 className="mx-2">Doc path: <span className="font-bold">{this.props.docLocation}</span></h2>
            <div className="mx-2 border-2 border-slate-600 rounded bg-amber-600">
              <Link href="list"><p className="mx-2 text-white hover:cursor-help">Go to List</p></Link>
            </div>
          </div>
          <form>
            <div className='mx-2 my-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded whitespace-pre-line"
                        rows={10} value={this.state.jsonData}
                        onChange={(e) => this.setState({jsonData: e.target.value})}/>
            </div>
            <AGButton type='primary' onClickEvent={() => this.updateData()}>Update json</AGButton>
          </form>
        </div>
      </div>
    );
  }

  async updateData() {
    await UpdateDoc(this.props.docLocation, this.state.jsonData);
    alert(`Doc "${this.props.docLocation}" has been updated`);
  }
}

export const getServerSideProps: GetServerSideProps<Omit<AssetUpdateProps, 'router'>> = async (context) => {
  const {docLocation} = context.query;
  let newDocLocation: string = '';
  let _docInfo: any[] = [];
  if (docLocation) {
    if ((docLocation as string).split('/').length % 2 !== 0) {
      newDocLocation = (docLocation as string).slice(0, docLocation.lastIndexOf('/'));
    } else {
      newDocLocation = docLocation as string;
    }
    _docInfo = await GetInfoDB<any>(newDocLocation);
  }

  return {
    props: {
      docLocation: newDocLocation,
      docInfo: _docInfo.length > 0 ? JSON.stringify(_docInfo[0]) : null,
    }
  };
}

export default withRouter(Update);