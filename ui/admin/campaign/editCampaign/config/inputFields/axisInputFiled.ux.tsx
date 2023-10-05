import { Dispatch, SetStateAction } from "react";
import { CastNumberToString } from "../../../../../../utils/common.util";

// Agrega una restricción en el tipo genérico Type
interface AxisInputFieldUIProps<Type, TypeKeys extends keyof Type> {
  inputLabel: string;
  axisLabels: string[];
  configProp: Record<TypeKeys, number>;
  setConfigProp: Dispatch<SetStateAction<Record<TypeKeys, number>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<number>>) => void;
}

export default function AxisInputFieldUI<Type>({ inputLabel, axisLabels, configProp, setConfigProp, handleInputChange }: AxisInputFieldUIProps<Type, keyof Type>) {
  return (
    <div>
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
        {inputLabel}:
      </p>
      <div className="flex gap-4 px-2">
        {axisLabels.map((axis) => (
          <div className="flex items-center gap-2" key={axis}>
            <p>{axis}:</p>
            <input
              type="number"
              name={axis.toLowerCase()}
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
              value={CastNumberToString(configProp[axis.toLowerCase() as keyof Type])}
              onChange={(e) => handleInputChange(e, (value) => setConfigProp({ ...configProp, [axis.toLowerCase()]: value }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
