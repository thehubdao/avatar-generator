import { FormEvent, useRef, useState } from "react";
import { BasicData, CampaignParameters } from "../../../interfaces/common.interface";
import AGButton from "../../common/ag-button.component";
import {
  GetCurrentUser,
  HandleNotLoggedIn,
  InsertDocWithId,
  UpdateDocObject,
  UploadFile
} from "../../../utils/firebase.util";
import { FirestoreGlobalLocation, StorageLocation } from "../../../enums/firebase.enum";
import { GlobalValues, Module } from "../../../enums/common.enum";
import { UserInterface } from "../../../interfaces/firebase.interface";
import { LogError } from "../../../utils/common.util";
import { IoAlert } from 'react-icons/io5';

interface NewCampaignProps {
  campaignList?: string[];
  onCampaignCreated?: (didCreate: boolean) => void;
}

export default function CampaignAdd({ onCampaignCreated, campaignList }: NewCampaignProps) {
  const campaignNameInput = useRef<HTMLInputElement>(null);
  const campaignBaseInput = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string>();
  const [featuresNum, setFeatureNum] = useState<number>();
  const [accessoriesNum, setAccessoryNum] = useState<number>();
  const [featureList, setFeatureList] = useState<BasicData[]>([]);
  const [accessoryList, setAccessoryList] = useState<BasicData[]>([]);

  const [hasCampaignName, setHasCampaignName] = useState<boolean>(false);
  const [hasCampaignBase, setHasCampaignBase] = useState<boolean>(false);

  function Card() {
    return (
      <div className="rounded-2xl h-96 w-72 flex flex-col justify-center items-center shadow-flat-soft hover:shadow-flat-hard overflow-hidden">
        <div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-end">
          <div className="flex justify-end gap-2">
            <label className="bg-bg w-fit px-5 rounded-full cursor-pointer" htmlFor="newCampaignBase">
              <p className="py-1">Upload</p>
              <input type="file" id="newCampaignBase" ref={campaignBaseInput} className="hidden" accept=".glb" onChange={checkCampaignBase}/>
            </label>
          </div>
        </div>
      </div>
    )
  }

  function renderFeatureInputs() {
    if (!featuresNum) return <></>;

    return Array.from({ length: featuresNum }).map((_, index) =>
      <div key={`fKey_${index}`}>
        <p>Feature:</p>
        <input type="text" value={featureList[index]?.id} required placeholder={`${index + 1} feature type`}
          onChange={event => setFeatureList((prevState) => {
            if (prevState[index] == undefined) prevState[index] = { val: '', id: '' };
            prevState[index].id = event.target.value.trim();
            return prevState;
          })} />
        <p>Name:</p>
        <input type="text" value={featureList[index]?.val} required placeholder={`${index + 1} feature section name`}
          onChange={event => setFeatureList((prevState) => {
            prevState[index].val = event.target.value.trim();
            return prevState;
          })} />
        <hr />
      </div>);
  }

  function renderAccessoryInputs() {
    if (!accessoriesNum) return <></>;

    return Array.from({ length: accessoriesNum }).map((_, index) =>
      <div key={`aKey_${index}`}>
        <p>Accessory:</p>
        <input type="text" value={accessoryList[index]?.id} required placeholder={`${index + 1} accessory type`}
          onChange={event => setAccessoryList((prevState) => {
            if (prevState[index] == undefined) prevState[index] = { val: '', id: '' };
            prevState[index].id = event.target.value.trim();
            return prevState;
          })} />
        <p>Name:</p>
        <input type="text" value={accessoryList[index]?.val} required placeholder={`${index + 1} accessory bone`}
          onChange={event => setAccessoryList((prevState) => {
            prevState[index].val = event.target.value.trim();
            return prevState;
          })} />
        <hr />
      </div>);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Create campaign folder
    if (campaignNameInput.current == null)
      return setMessage('Missing campaign Name!');

    const newCampaign = campaignNameInput.current.value;

    // Upload armature file and keep it
    if (campaignBaseInput.current == null || campaignBaseInput.current.files == null)
      return setMessage('Missing Armature!');

    const newArmature = campaignBaseInput.current.files.item(0);

    // Get current user UID - Promises
    const [uploadedArmature, userInfo] = await Promise.all([
      UploadFile(newArmature, StorageLocation.AvatarBase, undefined, newCampaign),
      GetCurrentUser()
    ]);

    if (uploadedArmature == undefined) return LogError(Module.CampaignAdd, "Error uploading armature");

    // Check userInfo exists
    if (userInfo == null) return void HandleNotLoggedIn();

    // Get information for the features
    const newFeatureList = featuresNum ? featureList.slice(0, featuresNum) : [];

    // Get information for the accessories
    const newAccessoryList = accessoriesNum ? accessoryList.slice(0, accessoriesNum) : [];
    newAccessoryList.forEach(a => a.id = `${a.id}${GlobalValues.AccEnd}`);

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
    if (result.success)
      alert("Campaign created successfully");
    else
      setMessage(result.errMessage);

    if (onCampaignCreated)
      onCampaignCreated(result.success);
  }

  function checkCampaignName() {
    if (campaignNameInput.current?.value == '') {
      setHasCampaignName(false);
    } else {
      setHasCampaignName(true);
    }
  }

  function checkCampaignBase() {
    const file = campaignBaseInput.current?.files?.length;
    // eslint-disable-next-line no-console
    console.log("file: ", file, typeof(file));
    if (!file || file < 1) {
      // eslint-disable-next-line no-console
      console.log("falso");
      setHasCampaignBase(false);
    } else {
      // eslint-disable-next-line no-console
      console.log("true");
      setHasCampaignBase(true);
    }
  }

  return (
    <div>
      <h1 className="font-humane text-9xl text-gray-normal">CREATE CAMPAIGN:</h1>
      <div>
        <input
          ref={campaignNameInput}
          className="font-poppins font-bold text-7xl text-gray-normal uppercase bg-transparent border-l border-gray-light outline-none pl-2"
          type="text"
          name="newCampaignName"
          id="newCampaignName"
          autoFocus
          autoComplete="off"
          placeholder="NAME"
          onChange={checkCampaignName}
        />
        { hasCampaignName ?
            <p>Campaigns are the container for a personalization system. A campaign is formed by 
              <span className="text-purple font-bold"> AVATAR BASE</span>, 
              <span className="text-orange font-bold"> FEATURES</span> and 
              <span className="text-blue font-bold"> ANIMATIONS</span>.</p>
            :
            <label htmlFor="newCampaignName" className="block text-gray-light cursor-pointer">Set the campaign&apos;s name.</label>
          }
        
      </div>
      { hasCampaignName &&
        <div className="pt-10 flex gap-6">
          <Card />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl text-purple font-poppins font-bold">AVATAR BASE (AB)</h2>
              <p>The <span className="text-purple font-bold">AB</span> is the reference for all of the avatar features.</p>
              <div className="relative bg-purple p-5 rounded-r-2xl rounded-bl-lg rounded-t- mt-5 flex gap-5">
                <div className="absolute top-0 -left-3 border-8 border-l-transparent border-b-transparent border-purple"></div>
                <div className="w-10 h-10 text-4xl text-purple bg-white rounded-full flex justify-center items-center">
                  <IoAlert />
                </div>
                <div className="text-white text-sm">
                  <label className="underline cursor-pointer" htmlFor="newCampaignBase">
                    Upload the avatar base in <span className="font-bold">.GLB</span> format.
                  </label>
                  <p>
                    Remember AB file is formed by armature and initial features set.
                  </p>
                </div>
              </div>
            </div>
            { hasCampaignBase &&
              <AGButton nm align="start" onClickEvent={() => void checkCampaignBase()}>
                Create
              </AGButton>
            }
          </div>
        </div>
      }
      {/* <form onSubmit={event => void onSubmit(event)}>
        {message != undefined ? <AGText type="text" mark='😡'>{message}</AGText> : ''}
        <AGText type="th2">Nombre Campaña</AGText>
        <input type="text" ref={campaignNameInput} placeholder="Campaign name" required />
        <AGText type="th2">Armature</AGText>
        <input type="file" ref={armatureFileInput} placeholder="Armature" required />
        <AGText type="th2">Amount of features</AGText>
        <input type="number" onChange={event => setFeatureNum(event.target.valueAsNumber)}
          placeholder="Amount of features" min={0} />
        <AGText type="th2">Features:</AGText>
        {renderFeatureInputs()}
        <hr />
        <AGText type="th2">Amount of accessories</AGText>
        <input type="number" onChange={event => setAccessoryNum(event.target.valueAsNumber)}
          placeholder="Amount of accessories" min={0} />
        <AGText type="th2">Accessories:</AGText>
        {renderAccessoryInputs()}
        <AGButton form>Create Campaign</AGButton>
      </form> */}
    </div>
  );
}