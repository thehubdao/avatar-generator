import { ChangeEvent, Dispatch, KeyboardEvent, SetStateAction, useEffect, useState } from "react";
import { GetStringToNumberInput } from "../../../../../../utils/input.util";

interface AxisInputFieldUIProps<T, TKey extends keyof T> {
  inputLabel: string;
  axisLabels: string[];
  configProp: Record<TKey, number>;
  setConfigProp: (value: T) => void;
  minValue?: number;
  maxValue?: number;
  steps?: number;
}

export default function AxisInputFieldUI<T>({
  inputLabel,
  axisLabels,
  configProp,
  setConfigProp,
  minValue = Number.NEGATIVE_INFINITY,
  maxValue = Number.POSITIVE_INFINITY,
  steps = 1
}: AxisInputFieldUIProps<T, keyof T>) {
  const [temporaryConfig, setTemporaryConfig] = useState<Record<keyof T, number>>(configProp);

  const handleTempInputChange = (e: ChangeEvent<HTMLInputElement>, axis: keyof T) => { // axis.toLowerCase()
    setTemporaryConfig({ ...configProp, [axis]: e.target.value });
  };

  const handleInputBlur = (axis: keyof T) => {
    const newNumber = GetStringToNumberInput(`${temporaryConfig[axis]}`);

    if (`${temporaryConfig[axis]}` !== '') {
      const newObject = { ...configProp, [axis]: newNumber }
      setConfigProp(newObject as T);
      setTemporaryConfig(newObject);
    } else {
      // The value is not valid, revert to the previous value
      setTemporaryConfig(configProp);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, axis: keyof T) => {
    if (e.key === 'Enter') {
      handleInputBlur(axis);
    }
  }

  //* Update current input field
  useEffect(() => {
    setTemporaryConfig(configProp);
  }, [configProp]);

  return (
    <div>
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
        {inputLabel}:
      </p>
      <div className="flex justify-between gap-4 px-2">
        {axisLabels.map((axis) => (
          <div className="flex items-center gap-2" key={axis}>
            <p>{axis}:</p>
            <input
              type="number"
              name={axis.toLowerCase()}
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
              value={temporaryConfig[axis.toLowerCase() as keyof T]}
              min={minValue}
              max={maxValue}
              step={steps}
              onChange={(e) => handleTempInputChange(e, axis.toLowerCase() as keyof T)}
              onBlur={(_) => handleInputBlur(axis.toLowerCase() as keyof T)}
              onKeyDown={(e) => handleInputKeyDown(e, axis.toLowerCase() as keyof T)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
