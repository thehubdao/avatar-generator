import AGText from "../common/ag-text.component";
import {FormEvent, useRef, useState} from "react";
import {BasicData, CampaignParameters} from "../../interfaces/common.interface";
import AGButton from "../common/ag-button.component";
import {
  GetCurrentUser,
  HandleNotLoggedIn,
  InsertDocWithId,
  UpdateDocObject,
  UploadFile
} from "../../utils/firebase.util";
import {FirestoreGlobalLocation, StorageLocation} from "../../enums/firebase.enum";
import {GlobalValues} from "../../enums/common.enum";
import {UserInterface} from "../../interfaces/firebase.interface";

interface NewCampaignProps {
  campaignList?: string[];
  onCampaignCreated?: (didCreate: boolean) => void;
}

export default function NewCampaign({onCampaignCreated, campaignList}: NewCampaignProps) {
  const campaignNameInput = useRef<HTMLInputElement>(null);
  const armatureFileInput = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string>();
  const [featuresNum, setFeatureNum] = useState<number>();
  const [accessoriesNum, setAccessoryNum] = useState<number>();
  const [featureList, setFeatureList] = useState<BasicData[]>([]);
  const [accessoryList, setAccessoryList] = useState<BasicData[]>([]);

  function renderFeatureInputs() {
    if (!featuresNum) return <></>;

    return Array.from({length: featuresNum}).map((_, index) =>
      <div key={`fKey_${index}`}>
        <p>Feature:</p>
        <input type="text" value={featureList[index]?.id} required placeholder={`${index + 1} feature type`}
               onChange={event => setFeatureList((prevState) => {
                 if (prevState[index] == undefined) prevState[index] = {val: '', id: ''};
                 prevState[index].id = event.target.value;
                 return prevState;
               })}/>
        <p>Name:</p>
        <input type="text" value={featureList[index]?.val} required placeholder={`${index + 1} feature section name`}
               onChange={event => setFeatureList((prevState) => {
                 prevState[index].val = event.target.value;
                 return prevState;
               })}/>
        <hr/>
      </div>);
  }

  function renderAccessoryInputs() {
    if (!accessoriesNum) return <></>;

    return Array.from({length: accessoriesNum}).map((_, index) =>
      <div key={`aKey_${index}`}>
        <p>Accessory:</p>
        <input type="text" value={accessoryList[index]?.id} required placeholder={`${index + 1} accessory type`}
               onChange={event => setAccessoryList((prevState) => {
                 if (prevState[index] == undefined) prevState[index] = {val: '', id: ''};
                 prevState[index].id = event.target.value;
                 return prevState;
               })}/>
        <p>Name:</p>
        <input type="text" value={accessoryList[index]?.val} required placeholder={`${index + 1} accessory bone`}
               onChange={event => setAccessoryList((prevState) => {
                 prevState[index].val = event.target.value;
                 return prevState;
               })}/>
        <hr/>
      </div>);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Create campaign folder
    if (campaignNameInput.current == null)
      return setMessage('Missing campaign Name!');

    const newCampaign = campaignNameInput.current.value;

    // Upload armature file and keep it
    if (armatureFileInput.current == null || armatureFileInput.current.files == null)
      return setMessage('Missing Armature!');

    const newArmature = armatureFileInput.current.files[0];

    // Get current user UID - Promises
    const [uploadedArmature, userInfo] = await Promise.all([
      UploadFile(newArmature, StorageLocation.BaseMesh, undefined, newCampaign),
      GetCurrentUser()
    ]);

    // Check userInfo exists
    if (userInfo == null) return void HandleNotLoggedIn();

    // Get information for the features
    const newFeatureList = featuresNum ? featureList.slice(0, featuresNum) : [];

    // Get information for the accessories
    const newAccessoryList = accessoriesNum ? accessoryList.slice(0, accessoriesNum) : [];
    newAccessoryList.forEach(a => a.id = `${a.id}${GlobalValues.AccEnd}`);
    console.log(newAccessoryList);

    // Make doc campaign object
    const docData: CampaignParameters = {
      owner: userInfo.uid,
      armature: uploadedArmature,
      features: newFeatureList,
      accessories: newAccessoryList,
    };

    // Upload information to DB
    const result = await InsertDocWithId(newCampaign, docData, FirestoreGlobalLocation.Campaign);

    // Update user info
    const newUserInfo: Partial<UserInterface> = {
      campaign: campaignList ? [...campaignList, newCampaign] : [newCampaign]
    };

    await UpdateDocObject(FirestoreGlobalLocation.User, newUserInfo, undefined, userInfo.uid);

    // Send user to admin dashboard
    if (result.successful)
      alert("Campaign created successfully");
    else
      setMessage(result.errMessage);

    if (onCampaignCreated)
      onCampaignCreated(result.successful);
  }

  return (
    <form onSubmit={event => void onSubmit(event)}>
      {message != undefined ? <AGText type="text" mark='😡'>{message}</AGText> : ''}
      <AGText type="th2">Nombre Campaña</AGText>
      <input type="text" ref={campaignNameInput} placeholder="Campaign name" required/>
      <AGText type="th2">Armature</AGText>
      <input type="file" ref={armatureFileInput} placeholder="Armature" required/>
      <AGText type="th2">Amount of features</AGText>
      <input type="number" onChange={event => setFeatureNum(event.target.valueAsNumber)}
             placeholder="Amount of features" min={0}/>
      <AGText type="th2">Features:</AGText>
      {renderFeatureInputs()}
      <hr/>
      <AGText type="th2">Amount of accessories</AGText>
      <input type="number" onChange={event => setAccessoryNum(event.target.valueAsNumber)}
             placeholder="Amount of accessories" min={0}/>
      <AGText type="th2">Accessories:</AGText>
      {renderAccessoryInputs()}
      <AGButton form>Create Campaign</AGButton>
    </form>
  );
}