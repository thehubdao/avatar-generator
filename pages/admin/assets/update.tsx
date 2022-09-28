import {Component} from "react";
import {GetServerSideProps} from "next";
import {GetInfoDB, HandleNotLoggedIn, ReplaceDoc} from "../../../utils/firebase.util";
import AGButton from "../../../components/common/ag-button.component";
import Link from "next/link";
import Head from "next/head";

interface AssetUpdateProps {
  docLocation?: string;
  docInfo?: string | null;
}

interface AssetUpdateState {
  jsonData?: string;
}

export default class Update extends Component<AssetUpdateProps, AssetUpdateState> {
  constructor(props: AssetUpdateProps) {
    super(props);
    this.state = {
      jsonData: props.docInfo === null ? undefined : this.formatJson(props.docInfo!),
    };
  }
  
  async componentDidMount() {
    await HandleNotLoggedIn();
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
      <>
        <Head>
          <title>Update Asset</title>
        </Head>
        <div className="flex justify-center">
          <div className="w-2/3">
            <h1 className="ml-5 font-bold my-2"><span>🤡</span>Update Doc</h1>
            <div className="flex justify-between my-2">
              <h2 className="mx-2">Doc path: <span className="font-bold">{this.props.docLocation}</span></h2>
              <AGButton type="alert">
                <Link href="list">Go to List</Link>
              </AGButton>
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
      </>
    );
  }

  async updateData() {
    await ReplaceDoc(this.props.docLocation, this.state.jsonData);
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