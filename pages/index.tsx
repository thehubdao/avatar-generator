import {GetServerSideProps} from "next";
import {GetParameter} from "../utils/firebase.util";
import {FirestoreParameters} from "../enums/firebase.enum";

export default function RootPage() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {campaign, ...params} = context.query;
  let leCampaign = campaign as string;
  if (leCampaign == undefined) {
    const baseResult = await GetParameter<string>(undefined, FirestoreParameters.BaseCampaign);
    if (baseResult.success)
      leCampaign = baseResult.value;
    else
      return {notFound: true};
  }
  
  const leParams = Object.keys(params).length > 0 ? `?${await (new Promise<string>(resolve => {
    resolve(new URLSearchParams(params as Record<string, string>).toString());
  }))}` : '';

  return {
    redirect: {
      destination: `/${leCampaign}${leParams}`,
      permanent: false,
    },
    props: {}
  }
}