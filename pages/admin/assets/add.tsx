import {Component} from "react";
import {FirebaseUtil} from "../../../utils/firebase.util";
import {FirestoreParameters, FirestoreValues, StorageValues} from "../../../enums/common.enum";
import AGButton from "../../../components/AG-Button";
import {FeatureLocationApi} from "../../../interfaces/api.interface";
import {BasicData} from "../../../interfaces/common.interface";
import {GetServerSideProps} from "next";
import Link from "next/link";

interface AssetAddProps {
  campaignOptions: string[];
}

interface AssetAddState {
  jsonData?: string;
  dbLocation?: FirestoreValues;
  formData: FeatureLocationApi;
  typeOptions: BasicData[];
  selectedCampaign: string;
  fileToUpload?: File;
  thumbToUpload?: File;
  locationOptions: string[];
  loneFile?: File;
  loneFileOptions: string[];
  selectedStorage: StorageValues;
}

export default class Add extends Component<AssetAddProps, AssetAddState> {

  constructor(props: AssetAddProps) {
    super(props);
    this.state = {
      jsonData: '',
      dbLocation: FirestoreValues.Parts,
      formData: {name: '', path: '', type: '', thumb: '', campaign: []},
      typeOptions: [],
      selectedCampaign: '',
      locationOptions: Object.values(FirestoreValues),
      loneFileOptions: Object.values(StorageValues),
      selectedStorage: StorageValues.BaseMesh,
    };
  }

  async getTypeOptionsByCampaign(campaign: string) {
    const diff = this.state.dbLocation === FirestoreValues.Accessories ? 'Accessories' : '';

    this.setState({
      selectedCampaign: campaign,
      typeOptions: campaign.length <= 0 ? [] : (await FirebaseUtil.Instance().GetParameters<BasicData[]>(campaign + diff))[0]
    });
  }

  renderTypeOptions() {
    return this.state.typeOptions?.map(x => {
      return <option value={x.id} key={x.id}>{x.id}</option>
    });
  }

  renderCampaignOptions() {
    return this.props.campaignOptions.map(x => {
      return <option value={x} key={x}>{x}</option>
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
      case FirestoreValues.Accessories:
      case FirestoreValues.Parts:
        return this.renderPartForm();
      case FirestoreValues.Parameters:
        return this.renderParameterForm();
    }
  }

  renderPartForm() {
    const {formData, selectedCampaign} = this.state;
    return (
      <>
        <div className="mx-2 my-2 border-slate-600 border-2 rounded">
          <form>
            <h2 className="font-bold ml-5 mb-2"><span>😎</span>Form</h2>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Name:</p>
              <input className="w-52 border-slate-600 border-2 rounded px-1" type="text" required
                     value={formData.name}
                     onChange={(e) => this.setState({formData: {...formData, name: e.target.value}})}/>
            </div>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Campaign:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={selectedCampaign}
                      onChange={e => this.getTypeOptionsByCampaign(e.target.value)}>
                <option value=''>Select...</option>
                {this.renderCampaignOptions()}
              </select>
            </div>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right">Type:</p>
              <select className="w-52 rounded border-2 border-slate-600" required
                      value={formData.type}
                      onChange={e => this.setState({formData: {...formData, type: e.target.value}})}>
                <option value=''>Select...</option>
                {this.renderTypeOptions()}
              </select>
            </div>

            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">Thumb:</p>
              <input className="ml-2 my-2" type="file" accept=".jpg,.png" required
                     onChange={e => this.setState({thumbToUpload: e.target.files ? e.target.files[0] : undefined})}/>
            </div>
            <div className="flex my-2">
              <p className="mx-2 w-20 text-right my-2">File:</p>
              <input className="ml-2 my-2" type="file" accept=".glb" required
                     onChange={e => this.setState({fileToUpload: e.target.files ? e.target.files[0] : undefined})}/>
            </div>

          </form>
        </div>
        <AGButton type='secondary' onClickEvent={() => this.insertDBForm()}>Insert form</AGButton>
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
                      onChange={e => this.setState({dbLocation: e.target.value as FirestoreValues})}>
                {this.renderLocationOptions()}
              </select>
            </div>
            <div className="mx-2 my-2 border-2 border-slate-600 rounded bg-amber-600">
              <Link href="list"><p className="mx-2 text-white hover:cursor-help">Go to List</p></Link>
            </div>
          </div>

          {this.renderUploadType()}

          <form>
            <div className='mx-2'>
              <textarea required className="w-full border-2 border-amber-600 rounded" rows={5}
                        value={this.state.jsonData} onChange={(e) => this.setState({jsonData: e.target.value})}/>
            </div>
            <AGButton type='primary' form onClickEvent={() => this.insertDB()}>Insert json</AGButton>
          </form>

          <form>
            <div className="mx-2 my-2 border-slate-600 border-2 rounded">
              <h2 className="font-bold ml-5 mb-2"><span>🙋‍♂️</span>Lone File</h2>
              <div className="flex my-2">
                <p className="mx-2 w-20 text-right">Type:</p>
                <select className="w-52 rounded border-2 border-slate-600" required
                        value={selectedStorage}
                        onChange={e => this.setState({selectedStorage: e.target.value as StorageValues})}>
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
            <AGButton type='alert' form onClickEvent={() => this.insertFile()}>Insert File</AGButton>
          </form>
        </div>
      </div>
    );
  }

  async insertDB(jsonData: string | undefined = this.state.jsonData) {
    const {dbLocation} = this.state;
    if (dbLocation && jsonData) {
      if (dbLocation !== FirestoreValues.Parameters) {
        await FirebaseUtil.Instance().InsertDB(jsonData, dbLocation);
        alert('Done inserting');
      } else {
        await FirebaseUtil.Instance().UpdateDB(dbLocation, jsonData);
        alert('Done updating');
      }
    }
  }

  async insertDBForm() {
    const {formData, thumbToUpload, fileToUpload, dbLocation} = this.state;

    if (thumbToUpload && fileToUpload) {
      const uploadFileTo = dbLocation === FirestoreValues.Parts ? StorageValues.Part : StorageValues.Accessory;

      formData.thumb = await FirebaseUtil.Instance().UploadFile(thumbToUpload, StorageValues.Thumbnail);
      formData.path = await FirebaseUtil.Instance().UploadFile(fileToUpload, uploadFileTo, formData.type.toLowerCase());
      formData.campaign.push(this.state.selectedCampaign);

      await this.insertDB(JSON.stringify(formData));
      alert("Data inserted");
    }
  }

  async insertFile() {
    const {loneFile, selectedStorage} = this.state;
    if (loneFile && selectedStorage) {
      const newPath = await FirebaseUtil.Instance().UploadFile(loneFile, selectedStorage);
      console.log(newPath);
      alert("File uploaded");
    }
  }
}

export const getServerSideProps: GetServerSideProps<AssetAddProps> = async (context) => {
  const campaigns = (await FirebaseUtil.Instance().GetParameters<string[]>(FirestoreParameters.Campaigns))[0];

  return {
    props: {
      campaignOptions: campaigns,
    }
  };
}