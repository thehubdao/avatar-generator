import {Component} from "react";
import {GetInfoDB, ReplaceDoc} from "../../../utils/firebase.util";
import AGButton from "../../../components/common/ag-button.component";
import {AccessoryInterface, AnimationInterface, FeatureInterface} from "../../../interfaces/api.interface";
import {AdminComponents} from "../../../enums/common.enum";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";

interface AssetUpdateProps {
  docLocation?: string;
  changeComponent: ChangeComponentFunction;
}

interface AssetUpdateState {
  doc: string;
  jsonData: string;
  message?: string;
}

export default class AssetUpdate extends Component<AssetUpdateProps, AssetUpdateState> {
  constructor(props: AssetUpdateProps) {
    super(props);
    this.state = {
      doc: '',
      jsonData: '',
    }
  }
  
  async componentDidMount() {
    await this.initData();
  }
  
  async initData() {
    const {docLocation} = this.props;
    
    if(!docLocation) return this.setState({ message: 'Missing document information' });
    
    let newDocLocation = docLocation;
    
    if (docLocation.split('/').length % 2 !== 0) {
      newDocLocation = docLocation.slice(0, docLocation.lastIndexOf('/'));
    }
    
    const _docInfo = await GetInfoDB<FeatureInterface | AccessoryInterface | AnimationInterface>(newDocLocation);
    const jsonData = _docInfo.length > 0 ? this.formatJson(JSON.stringify(_docInfo[0])) : '';
    
    this.setState({
      doc: newDocLocation,
      jsonData,
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
      <>
        <div className="flex justify-center">
          <div className="w-2/3">
            <h1 className="ml-5 font-bold my-2"><span>🤡</span>Update Doc</h1>
            <div className="flex justify-between my-2">
              <h2 className="mx-2">Doc path: <span className="font-bold">{this.props.docLocation}</span></h2>
              <AGButton type="alert" onClickEvent={() => this.props.changeComponent(AdminComponents.AssetList)}>Go to List</AGButton>
            </div>
            <form>
              <div className='mx-2 my-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded whitespace-pre-line"
                        rows={10} value={this.state.jsonData}
                        onChange={(e) => this.setState({jsonData: e.target.value})}/>
              </div>
              <AGButton type='primary' onClickEvent={() => void this.updateData()}>Update json</AGButton>
            </form>
          </div>
        </div>
      </>
    );
  }

  async updateData() {
    if(!this.props.docLocation) {
      alert('Missing document location to update!');
      return;
    }
    
    await ReplaceDoc(this.state.doc, this.state.jsonData);
    alert(`Doc "${this.state.doc}" has been updated`);
  }
}