import AGButton from "../../common/ag-button.component";

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

/**
 ** Represents the mobile is building alert UI.
 * @returns {TSX.Element} The mobile build alert UI component.
 */
export default function MobileBuildAlert() {
  return (
    <div className="w-full min-h-[calc(100vh-176px)] flex flex-col items-center max-w-lg m-auto justify-between">
      <h1 className="font-humane text-9xl text-gray-normal">COMMING SOON</h1>
      <p className="text-center">We are working on the mobile version, while we finalize the details we invite you to visit the Hub DAO website. If you want to learn more about us, we invite you to contact us through our social networks.</p>
      <div className="w-fit">
        <AGButton nm full>
          <p className="font-bold">Go to The HUB Website</p>
        </AGButton>
        <div className="flex flex-row items-center justify-center flex-wrap pt-3 sm:pt-6">
          <AGButton nm fit>
            <a
              href="https://medium.com/@THEHUB_DAO"
              className="cursor-pointer"
              target="_blank"
            ><FaMedium className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://www.instagram.com/thehub_dao/"
              className="cursor-pointer"
              target="_blank"
            ><FaInstagram className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://www.linkedin.com/company/the-hub-dao/"
              className="cursor-pointer"
              target="_blank"
            ><FaLinkedin className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://twitter.com/thehub_dao"
              className="cursor-pointer"
              target="_blank"
            ><FaTwitter className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://t.me/thehub_dao"
              className="cursor-pointer"
              target="_blank"
            ><FaTelegramPlane className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://discord.com/invite/J35NGdPWgq"
              className="cursor-pointer"
              target="_blank"
            ><FaDiscord className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="https://etherscan.io/token/0x8765b1a0eb57ca49be7eacd35b24a574d0203656"
              className="cursor-pointer"
              target="_blank"
            ><FaEthereum className="social-media-icon" /></a>
          </AGButton>
          <AGButton nm fit>
            <a
              href="mailto:info@thedac.info"
              className="cursor-pointer"
              target="_blank"
            ><FaEnvelope className="social-media-icon" /></a>
          </AGButton>
        </div>
      </div>
    </div>
  )
}