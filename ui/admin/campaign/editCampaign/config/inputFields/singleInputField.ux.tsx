import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { GetStringToNumberInput } from "../../../../../../utils/input.util";

interface SingleInputFieldUIProps<T> {
  inputLabel: string;
  configProp: T;
  setConfigProp: Dispatch<SetStateAction<number>>;
  width?: string;
}

export default function SingleInputFieldUI<T>({ inputLabel, configProp, setConfigProp, width = 'w-full' }: SingleInputFieldUIProps<T>) {
  const [tempConfigProp, setTempConfigProp] = useState(`${configProp}`);

  const handleTempInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempConfigProp(e.target.value);
  };

  //* Handle input blur (when it loses focus)
  const handleInputBlur = () => {
    let newNumber = GetStringToNumberInput(tempConfigProp);

    if (!isNaN(newNumber) && newNumber >= 0) {
      setConfigProp(newNumber);
      setTempConfigProp(`${newNumber}`);
    } else {
      // The value is not valid, revert to the previous value
      setTempConfigProp(`${configProp}`);
    }
  };

  return (
    <div className={`${width}`}>
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
        {inputLabel}:
      </p>
      <div className="flex items-center px-2">
        <input
          type="string"
          name='intensity'
          className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
          value={tempConfigProp}
          onChange={(e) => handleTempInputChange(e)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInputBlur();
            }
          }}
        />
      </div>
    </div>
  )
}
