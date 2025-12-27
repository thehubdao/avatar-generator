import { Dispatch } from "react";
import { ShowModal } from "./modal.util";

export function CheckFileSize(
  fileSize: number,
  maxSize: number,
  scale: { label: string, bytes: number },
  setHasFileState: Dispatch<boolean>,
  refFile: HTMLInputElement,
  forceUpdate?: () => void
) {
  if (fileSize < maxSize * scale.bytes) {
    setHasFileState(true);
    if (forceUpdate) forceUpdate(); // force uptade when current file change to have visual feedback on app.
  } else {
    setHasFileState(false);
    refFile.value = ''; // clear file space
    ShowModal(`Asset file exceeds the allowed size limit (${maxSize} ${scale.label}).`);
  }
}