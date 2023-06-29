import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { GoToPage } from "../../../utils/router.util";
import { Module, PageLocation } from "../../../enums/common.enum";
import { reset } from "../../../store/addCampaignSlice";
import { GetCurrentUser, GetCurrentUserInfo, HandleNotLoggedIn, InsertDocWithId, UpdateDocObject, UploadFile } from "../../../utils/firebase.util";
import { FirestoreGlobalLocation, StorageLocation } from "../../../enums/firebase.enum";
import { LogError } from "../../../utils/common.util";
import { CampaignParameters } from "../../../interfaces/common.interface";
import { UserInterface } from "../../../interfaces/firebase.interface";
import { setUserInfo } from "../../../store/authSlice";
import { modal } from "../../../utils/modal.util";

interface CreateCampaignInterface {
  baseMeshFile?: File | null,
}

export default function CreateCampaign({ baseMeshFile }: CreateCampaignInterface) {
  const campaignName = useAppSelector(state => state.addCampaign.name);
  const campaignFeatures = useAppSelector(state => state.addCampaign.features);
  const campaignReady = useAppSelector(state => state.addCampaign.ready);
  const campaignList = useAppSelector(state => state.auth.userInfo?.campaign);
  const dispatch = useAppDispatch();

  async function submitCampaign() {
    if (campaignReady) {
      const userInfo = await GetCurrentUser();
      if (userInfo == null) {
        dispatch(reset());
        return void HandleNotLoggedIn();
      } else {
        const baseMeshUploaded = await UploadFile(baseMeshFile, StorageLocation.AvatarBase, undefined, campaignName);

        if (baseMeshUploaded == undefined) return LogError(Module.CampaignAdd, "Error uploading armature");

        // Make doc campaign object
        const docData: CampaignParameters = {
          owner: userInfo.uid,
          armature: baseMeshUploaded,
          features: campaignFeatures,
          accessories: [],
        };

        // Upload information to DB
        const result = await InsertDocWithId(campaignName, docData, FirestoreGlobalLocation.Campaign);
        dispatch(reset());
        void GoToPage(PageLocation.Admin);

        // Update user info
        const newUserInfo: Partial<UserInterface> = {
          campaign: campaignList ? [...campaignList, campaignName] : [campaignName]
        };

        await UpdateDocObject(FirestoreGlobalLocation.User, newUserInfo, undefined, userInfo.uid);

        // // Send user to admin dashboard
        if (result.success) {
          const uInfo = await GetCurrentUserInfo(true);
          if(uInfo) {
            const {role, name, account, email, campaign} = uInfo;
            void dispatch(setUserInfo({role, name, account, email, campaign}));
          }
          modal("Campaign created successfully");
        }
        else
          void LogError(Module.CampaignAdd, result.errMessage ?? 'Unknow error.');
      }
    }
  }

  useEffect(() => {
    void submitCampaign();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignReady]);

  return (<></>)
}