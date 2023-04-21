import {GetServerSideProps} from "next";

export default function AvatarSingleRootPage() {
  return (
    <></>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {campaign, combination} = context.query;

  if (campaign == undefined) return { notFound: true };
  
  let leCampaign = campaign;
  if (typeof campaign !== 'string')
    leCampaign = campaign.at(0) ?? '';
    
  
  let leCombination = '';
  if (combination != undefined) {
    if (typeof combination === 'string')
      leCombination = combination;
    else
      leCombination = combination.at(0) ?? '';
  }
  
  return {
    redirect: {
      destination: `/${leCampaign}/${leCombination}`,
      permanent: false
    }
  };
}