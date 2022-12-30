import {GetServerSideProps} from "next";
import {GlobalValues} from "../enums/common.enum";

export default function RootPage() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {campaign, ...params} = context.query;
  const leCampaign = campaign as string ?? GlobalValues.BaseCampaign;
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