import AGButton from "../../common/ag-button.component";
import { SocialMedia } from "../../../enums/socialmedia.enum";
import {
  FaLinkedin,
  FaTelegramPlane,
  FaDiscord,
  FaEthereum,
  FaInstagram,
  FaTwitter,
  FaMedium,
  FaEnvelope
} from "react-icons/fa";
import SocialMediaButton from "../../common/social-media-button.ui";
import { SocialMediaDataProps } from "../../../interfaces/common.interface";
import { ExternalLink } from "../../../enums/external-links.enum";

//* Social Media Data as a Object
const socialMediaData: Record<SocialMedia, SocialMediaDataProps> = {
  [SocialMedia.Medium]: { link: "https://medium.com/@THEHUB_DAO", icon: <FaMedium className="social-media-icon" />, },
  [SocialMedia.Instagram]: { link: "https://www.instagram.com/thehub_dao/", icon: <FaInstagram className="social-media-icon" />, },
  [SocialMedia.Linkedin]: { link: 'https://www.linkedin.com/company/the-hub-dao/', icon: <FaLinkedin className="social-media-icon" /> },
  [SocialMedia.Twitter]: { link: 'https://twitter.com/thehub_dao', icon: <FaTwitter className="social-media-icon" /> },
  [SocialMedia.Telegram]: { link: 'https://t.me/thehub_dao', icon: <FaTelegramPlane className="social-media-icon" /> },
  [SocialMedia.Discord]: { link: 'https://discord.com/invite/J35NGdPWgq', icon: <FaDiscord className="social-media-icon" /> },
  [SocialMedia.Etherscan]: { link: 'https://etherscan.io/token/0x8765b1a0eb57ca49be7eacd35b24a574d0203656', icon: <FaEthereum className="social-media-icon" /> },
  [SocialMedia.Mail]: { link: 'mailto:info@thedac.info', icon: <FaEnvelope className="social-media-icon" /> },
};

/**
 ** Represents the mobile is building alert UI.
 * @returns {TSX.Element} The mobile build alert UI component.
 */
export default function MobileBuildAlert() {
  return (
    <div className="w-full min-h-[calc(100vh-176px)] flex flex-col items-center max-w-lg m-auto justify-between">
      <h1 className="font-humane text-9xl text-gray-normal">COMMING SOON</h1>
      <p className="text-center">We are working on the mobile version, while we finalize the details we invite you to visit us on desktop version. If you want to learn more about us, we invite you to contact us through our social networks.</p>
      <div className="w-fit">
        <AGButton nm full onClickEvent={() => { window.open(ExternalLink.TheHub, "_blank"); }}>
          <p className="font-bold">Go to The HUB Website</p>
        </AGButton>
        <div className="flex flex-row items-center justify-center flex-wrap pt-3 sm:pt-6">
          {Object.values(SocialMedia).map((item, index) => <SocialMediaButton key={index} link={socialMediaData[item].link} icon={socialMediaData[item].icon} />)}
        </div>
      </div>
    </div>
  )
}