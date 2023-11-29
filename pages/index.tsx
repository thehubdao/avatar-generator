import {GetServerSideProps} from "next";
import {GLOBAL_VALUES} from "../constants/common.constant";

export default function RootPage() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {campaign, ...params} = context.query;
  const leCampaign = campaign as string ?? GLOBAL_VALUES.BaseCampaign;
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