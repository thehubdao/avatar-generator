import { Dispatch, SetStateAction } from "react";
import { CastNumberToString } from "../../../../../../utils/common.util";

interface SingleInputFieldUIProps<T> {
  inputLabel: string;
  configProp: T;
  setConfigProp: Dispatch<SetStateAction<number>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<number>>) => void;
}

export default function SingleInputFieldUI<T>({ inputLabel, configProp, setConfigProp, handleInputChange }: SingleInputFieldUIProps<T>) {
  return (
    <div className="w-1/3">
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
        {inputLabel}:
      </p>
      <div className="flex items-center px-2">
        <input
          type="number"
          name='intensity'
          className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
          value={configProp as number}
          onChange={(e) => handleInputChange(e, setConfigProp)}
        />
      </div>
    </div>
  )
}
