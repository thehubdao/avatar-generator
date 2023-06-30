import AGButton from "./ag-button.component"
import { SocialMediaDataProps } from "../../interfaces/common.interface"

/**
 ** Represents Social Media Button that redirect us to a link
 * @returns {TSX.Element} The social media button component.
 */
export default function SocialMediaButton({ link, icon }: SocialMediaDataProps) {
  return (
    <AGButton nm fit>
      <a
        href={link}
        className="cursor-pointer"
        target="_blank"
      >{icon}</a>
    </AGButton>
  )
}