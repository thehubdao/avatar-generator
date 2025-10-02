import Link from "next/link";
import SocialXSVG from "./SVG/socialXSVG.ui";
import SocialInstagramSVG from "./SVG/socialInstagramSVG.ui";
import SocialDiscordSVG from "./SVG/socialDiscordSVG.ui";
import SocialTelegramSVG from "./SVG/socialTelegramSVG.ui";
import SocialCommonGroundSVG from "./SVG/socialCommonGroundSVG.ui";
import { TheHubSocialLinks } from "../../../enums/citizens/common.enum";

interface SocialButtonsProps {
  className?: string;
}

export default function SocialButtons({className}: SocialButtonsProps) {
  return (
    <div className={className}>
      <Link target="_blank" href={TheHubSocialLinks.Telegram}>
        <SocialTelegramSVG />
      </Link>
      <Link target="_blank" href={TheHubSocialLinks.Discord}>
        <SocialDiscordSVG />
      </Link>
      <Link target="_blank" href={TheHubSocialLinks.CommonGround}>
        <SocialCommonGroundSVG />
      </Link>
      <Link target="_blank" href={TheHubSocialLinks.SocialX}>
        <SocialXSVG />
      </Link>
      <Link target="_blank" href={TheHubSocialLinks.SocialInstagram}>
        <SocialInstagramSVG />
      </Link>
      
    </div>
  )
}