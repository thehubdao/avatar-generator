import AGButton from "./ag-button.component"
import { SocialMediaDataProps } from "../../interfaces/common.interface"
import Link from "next/link"

/**
 ** Represents Social Media Button that redirect us to a link
 * @returns {TSX.Element} The social media button component.
 */
export default function SocialMediaButton({ link, icon }: SocialMediaDataProps) {
  return (
    <Link href={link} target="_blank">
      <AGButton nm fit>
        <>{icon}</>
      </AGButton>
    </Link>
  )
}