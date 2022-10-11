import {Component} from "react";
import {
  GetParameters,
  InsertDoc,
  LogOut,
  UpdateDoc,
  UploadFile
} from "../../../utils/firebase.util";
import {FirestoreLocation, StorageLocation} from "../../../enums/firebase.enum";
import AGButton from "../../../components/common/ag-button.component";
import {AssetInterface} from "../../../interfaces/api.interface";
import {AdminComponentParams, BasicData} from "../../../interfaces/common.interface";
import {AdminComponents} from "../../../enums/common.enum";

interface AssetAddProps {
  campaign: string;
  changeComponent: (newComponent: AdminComponents, params?: AdminComponentParams) => void;
}

interface AssetAddState {
  jsonData?: string;
  dbLocation?: FirestoreLocation;
  formData: Partial<AssetInterface>;
  typeOptions: BasicData[];
  fileToUpload?: File;
  thumbToUpload?: File;
  locationOptions: string[];
  loneFile?: File;
  loneFileOptions: string[];
  selectedStorage: StorageLocation;
  animation?: boolean;
}

export default class AssetAdd extends Component<AssetAddProps, AssetAddState> {

  constructor(props: AssetAddProps) {
    super(props);
    this.state = {
      jsonData: '',
      dbLocation: FirestoreLocation.Features,
      typeOptions: [],
      formData: {},
      locationOptions: Object.values(FirestoreLocation),
      loneFileOptions: Object.values(StorageLocation),
      selectedStorage: StorageLocation.BaseMesh,
    };
  }
  
  async componentDidMount() {
    await this.getTypeOptionsByCampaign();
  }

  async getTypeOptionsByCampaign(campaign: string = this.props.campaign) {
    const diff = this.state.dbLocation === FirestoreLocation.Accessories ? 'Accessories' : '';
    
    if(!this.state.animation)
      this.setState({
        typeOptions: campaign.length <= 0 ? [] : (await GetParameters<BasicData[]>(undefined, campaign + diff))[0]
      });
  }

  renderTypeOptions() {
    return this.state.typeOptions?.map(x => {
      return <option value={x.id} key={x.id}>{x.id}</option>
    });
  }

  renderLocationOptions() {
    return this.state.locationOptions.map(x => {
      return <option value={x} key={x}>{x}</option>
    });
  }

  renderFileStorageOptions() {
    return this.state.loneFileOptions.map(x => {
      return <option value={x} key={x}>{x}</option>
    });
  }

  renderUploadType() {
    switch (this.state.dbLocation) {
      case FirestoreLocation.Animations:
      case FirestoreLocation.Accessories:
      case FirestoreLocation.Features:
        return this.renderPartForm();
      case FirestoreLocation.Parameters:
        return this.renderParameterForm();
    }
  }

  renderPartForm() {
    const {formData, animation} = this.state;
    return (
      <>
        <div className="mx-2 my-2 border-slate-600 border-2 rounded">
          <form>
            <h2 className="font-bold ml-5 mb-2"><span>😎</span>Form</h2>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Name:</p>
              <input className="w-52 border-slate-600 border-2 rounded px-1" type="text" required
                     value={formData?.name}
                     onChange={(e) => this.setState({formData: {...formData, name: e.target.value}})}/>
            </div>
            { !animation &&
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Type:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={formData?.type}
                      onChange={e => this.setState({formData: {...formData, type: e.target.value}})}>
                <option value=''>Select...</option>
                {this.renderTypeOptions()}
              </select>
            </div> }

            { !animation &&
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">Thumb:</p>
              <input className="ml-2 my-2" type="file" accept=".jpg,.png" required
                     onChange={e => this.setState({thumbToUpload: e.target.files ? e.target.files[0] : undefined})}/>
            </div> }
            
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">File:</p>
              <input className="ml-2 my-2" type="file" accept=".glb" required
                     onChange={e => this.setState({fileToUpload: e.target.files ? e.target.files[0] : undefined})}/>
            </div>

          </form>
        </div>
        <AGButton type='secondary' onClickEvent={() => void this.insertDBForm()}>Insert form</AGButton>
      </>
    );
  }

  renderParameterForm() {
    return (
      <>
        <p><span>👯‍♀️</span>Insert new parameter on textfield (as json object) and it will join the parameters</p>
      </>
    );
  }

  render() {
    const {dbLocation, selectedStorage} = this.state;

    return (
      <div className='flex justify-center'>
        <div className='w-2/3'>
          <h1 className="ml-5 my-2 font-bold">Insert Into DB</h1>
          <div className="flex justify-between">
            <div className="flex my-2">
              <p className="mx-2">Db location:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={dbLocation}
                      onChange={e => this.setState({
                        dbLocation: e.target.value as FirestoreLocation,
                        animation: e.target.value === FirestoreLocation.Animations
                      })}>
                {this.renderLocationOptions()}
              </select>
            </div>
            <div className="flex">
              <AGButton type="alert" onClickEvent={() => this.props.changeComponent(AdminComponents.AssetList)}>Go to List</AGButton>
              <AGButton type="danger" onClickEvent={void LogOut}>Log Out</AGButton>
            </div>
          </div>

          {this.renderUploadType()}

          <form>
            <div className='mx-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded" rows={5}
                        value={this.state.jsonData} onChange={(e) => this.setState({jsonData: e.target.value})}/>
            </div>
            <AGButton type='primary' onClickEvent={() => void this.insertDB()}>Insert json</AGButton>
          </form>

          <form>
            <div className="mx-2 my-2 border-slate-600 border-2 rounded">
              <h2 className="font-bold ml-5 mb-2"><span>🙋‍♂️</span>Lone File</h2>
              <div className="flex my-2">
                <p className="mx-2 w-20 text-right">Type:</p>
                <select className="w-52 rounded border-2 border-slate-600" required
                        value={selectedStorage}
                        onChange={e => this.setState({selectedStorage: e.target.value as StorageLocation})}>
                  <option value=''>Select...</option>
                  {this.renderFileStorageOptions()}
                </select>
              </div>
              <div className="flex my-2">
                <p className="mx-2 w-20 text-right my-2">File:</p>
                <input className="ml-2 my-2" type="file" required
                       onChange={e => this.setState({loneFile: e.target.files ? e.target.files[0] : undefined})}/>
              </div>
            </div>
            <AGButton type='alert' onClickEvent={() => void this.insertFile()}>Insert File</AGButton>
          </form>
        </div>
      </div>
    );
  }

  async insertDB(jsonData: string | undefined = this.state.jsonData) {
    const {dbLocation} = this.state;
    if (dbLocation && jsonData) {
      if (dbLocation !== FirestoreLocation.Parameters) {
        await InsertDoc(jsonData, dbLocation);
        alert('Done inserting');
      } else {
        await UpdateDoc(dbLocation, jsonData);
        alert('Done updating');
      }
    }
  }

  async insertDBForm() {
    const {formData, thumbToUpload, fileToUpload} = this.state;
    
    if(!formData) {
      console.error("Missing Form Data!");
      return;
    }
    
    if (fileToUpload) {
      const uploadFileTo = this.uploadTo();

      if(thumbToUpload)
        formData.thumb = await UploadFile(thumbToUpload, StorageLocation.Thumbnail);
      
      formData.path = await UploadFile(fileToUpload, uploadFileTo, formData.type);

      await this.insertDB(JSON.stringify(formData));
      alert("Data inserted");
    }
  }
  
  uploadTo(location: FirestoreLocation | undefined = this.state.dbLocation) {
    switch (location) {
      case FirestoreLocation.Features:
        return StorageLocation.Part;
      case FirestoreLocation.Accessories:
        return StorageLocation.Accessory;
      case FirestoreLocation.Animations:
        return StorageLocation.Animation;
      default:
        return StorageLocation.Missing;
    }
  }

  async insertFile() {
    const {loneFile, selectedStorage} = this.state;
    if (loneFile && selectedStorage) {
      const newPath = await UploadFile(loneFile, selectedStorage);
      console.log(newPath);
      alert("File uploaded");
    }
  }
}