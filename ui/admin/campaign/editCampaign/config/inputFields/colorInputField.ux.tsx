import { Dispatch, SetStateAction } from "react";

interface ColorInputFieldUIProps {
  inputLabel: string;
  configProp: string;
  setConfigProp: Dispatch<SetStateAction<string>>;
}

export default function ColorInputFieldUI({ inputLabel, configProp, setConfigProp }: ColorInputFieldUIProps) {
  return (
    <div className="mt-2 pt-4 px-2">
      <p className="font-poppins font-medium text-purple pb-2">{inputLabel}:</p>
      <div className="relative rounded-full overflow-hidden w-full h-12">
        <input type="color" name="" value={`#${configProp}`} className="absolute -top-2 -left-2 w-[130%] h-[130%]"
          onChange={e => { setConfigProp(e.target.value.substring(1)) }} />
        <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
          <p className="text-xs">{configProp}</p>
        </div>
      </div>
    </div>
  )
}
