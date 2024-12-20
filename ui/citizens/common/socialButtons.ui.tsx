import Link from "next/link";
import { TheHubSocialLinks } from "../../../enums/citizens/common.enum";
import SocialXSVG from "./SVG/socialXSVG.ui";
import SocialInstagramSVG from "./SVG/socialInstagramSVG.ui";
import SocialDiscordSVG from "./SVG/socialDiscordSVG.ui";
import SocialTelegramSVG from "./SVG/socialTelegramSVG.ui";
import SocialCommonGroundSVG from "./SVG/socialCommonGroundSVG.ui";

interface SocialButtonsProps {
  className?: string;
}

export default function SocialButtons({className}: SocialButtonsProps) {
  return (
    <div className={className}>
      <Link href={TheHubSocialLinks.Telegram}>
        <SocialTelegramSVG />
      </Link>
      <Link href={TheHubSocialLinks.Discord}>
        <SocialDiscordSVG />
      </Link>
      <Link href={TheHubSocialLinks.CommonGround}>
        <SocialCommonGroundSVG />
      </Link>
      <Link href={TheHubSocialLinks.SocialX}>
        <SocialXSVG />
      </Link>
      <Link href={TheHubSocialLinks.SocialInstagram}>
        <SocialInstagramSVG />
      </Link>
      
    </div>
  )
}