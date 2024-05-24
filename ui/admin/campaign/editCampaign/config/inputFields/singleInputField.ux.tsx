import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { GetStringToNumberInput } from "../../../../../../utils/input.util";

interface SingleInputFieldUIProps<T> {
  inputLabel: string;
  configProp: T;
  setConfigProp: (value: number) => void;
  width?: string;
  minValue?: number;
  maxValue?: number;
  steps?: number;
}

export default function SingleInputFieldUI<T>({
  inputLabel,
  configProp,
  setConfigProp,
  width = 'w-full',
  minValue = Number.NEGATIVE_INFINITY,
  maxValue = Number.POSITIVE_INFINITY,
  steps = 1
}: SingleInputFieldUIProps<T>) {
  const [tempConfigProp, setTempConfigProp] = useState<string>(`${configProp as string}`);

  const handleTempInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempConfigProp(e.target.value);
  };

  const handleInputBlur = () => {
    const newNumber = GetStringToNumberInput(tempConfigProp);

    if (tempConfigProp !== '' && newNumber >= minValue && maxValue >= newNumber) {
      setConfigProp(newNumber);
      setTempConfigProp(`${newNumber}`);
    } else {
      // The value is not valid, revert to the previous value
      setTempConfigProp(`${configProp as string}`);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  }

  //* Update current input field
  useEffect(() => {
    setTempConfigProp(`${configProp as string}`);
  }, [configProp]);

  return (
    <div className={`${width}`}>
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
        {inputLabel}:
      </p>
      <div className="flex items-center px-2">
        <input
          type="number"
          name='intensity'
          className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg"
          value={tempConfigProp}
          min={minValue}
          max={maxValue}
          step={steps}
          onChange={(e) => handleTempInputChange(e)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      </div>
    </div>
  )
}
