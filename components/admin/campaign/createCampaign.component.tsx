import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { GoToPage } from "../../../utils/router.util";
import { Module, PageLocation } from "../../../enums/common.enum";
import { reset, setIsLoading } from "../../../store/addCampaignSlice";
import { GetCurrentUser, GetCurrentUserInfo, HandleNotLoggedIn, InsertDocWithId, UpdateDocObject, UploadFile } from "../../../utils/firebase.util";
import { FirestoreGlobalLocation, StorageLocation } from "../../../enums/firebase.enum";
import { LogError } from "../../../utils/common.util";
import { CampaignParameters } from "../../../interfaces/common.interface";
import { UserInterface } from "../../../interfaces/firebase.interface";
import { setUserInfo } from "../../../store/authSlice";
import { ShowModal } from "../../../utils/modal.util";

import CreateCampaignUI from "../../../ui/admin/campaign/createCampaign/createCampaign.ui"
import { useEffect } from "react";

export default function CreateCampaign() {
  const campaignName = useAppSelector(state => state.addCampaign.name);
  const campaignFeatures = useAppSelector(state => state.addCampaign.features);
  const campaignConfig = useAppSelector(state => state.addCampaign.config);
  const isLoading = useAppSelector(state => state.addCampaign.isLoading);
  const campaignList = useAppSelector(state => state.auth.userInfo?.campaign);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isLoading) dispatch(reset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitCampaign(avatarBaseFile: File | undefined) {
    if (isLoading) return;
    const userInfo = await GetCurrentUser();
    dispatch(setIsLoading(true));
    if (userInfo == null) {
      dispatch(reset());
      return void HandleNotLoggedIn();
    } else {
      const campaignNameOnLowerCase = campaignName.toLowerCase();

      const baseMeshUploaded = await UploadFile(avatarBaseFile, StorageLocation.AvatarBase, undefined, campaignNameOnLowerCase);
      if (baseMeshUploaded == undefined) return LogError(Module.CampaignAdd, "Error uploading armature");

      // Make doc campaign object
      const docData: CampaignParameters = {
        owner: userInfo.uid,
        armature: baseMeshUploaded,
        features: campaignFeatures,
        accessories: [],
        config: campaignConfig
      };

      // Upload information to DB
      const result = await InsertDocWithId(campaignNameOnLowerCase, docData, FirestoreGlobalLocation.Campaign);

      // Update user info
      const newUserInfo: Partial<UserInterface> = {
        campaign: campaignList ? [...campaignList, campaignNameOnLowerCase] : [campaignNameOnLowerCase]
      };

      await UpdateDocObject(FirestoreGlobalLocation.User, newUserInfo, undefined, userInfo.uid);

      // // Send user to admin dashboard
      if (result.success) {
        const uInfo = await GetCurrentUserInfo(true);
        if (uInfo) {
          const { role, name, account, email, campaign } = uInfo;
          void dispatch(setUserInfo({ role, name, account, email, campaign }));
        }
        ShowModal("Campaign created successfully");
        dispatch(reset());
        void GoToPage(PageLocation.Admin);
      }
      else
        void LogError(Module.CampaignAdd, result.errMessage ?? 'Unknow error.');
    }
  }

  return (
    <CreateCampaignUI setAvatarBaseFile={(file: File | undefined) => submitCampaign(file)} />
  )
}