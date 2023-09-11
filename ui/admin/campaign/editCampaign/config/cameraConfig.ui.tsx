import { useRef } from "react";
import { AGVector3, LookAtVectors } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";

interface CameraConfigUIProps {
  camConfig?: LookAtVectors;
  updateCameraConfig: (camConfig: LookAtVectors) => Promise<void>;
}

export default function CameraConfigUI({ camConfig, updateCameraConfig }: CameraConfigUIProps) {
  const camPos = useRef<AGVector3>(camConfig?.pos ?? { x: 0, y: 0, z: 0 });
  const camLookAt = useRef<AGVector3>(camConfig?.lookAt ?? { x: 0, y: 0, z: 0 });

  const sendNewCamConfig = async () => {
    const newCameraConfig = {
      pos: camPos.current,
      lookAt: camLookAt.current
    }
    await updateCameraConfig(newCameraConfig);
  }

  return (
    <div>
      <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">Camera position:</p>
      <div className="flex gap-4 px-2">
        <div className="flex items-center gap-2">
          <p>X:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.pos?.x}
            onChange={e => camPos.current = {x: e.currentTarget.valueAsNumber, y: camPos.current.y, z: camPos.current.z}}
          />
        </div>
        <div className="flex items-center gap-2">
          <p>Y:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.pos?.y}
            onChange={e => camPos.current = {x: camPos.current.x, y: e.currentTarget.valueAsNumber, z: camPos.current.z}}
          />
        </div>
        <div className="flex items-center gap-2">
          <p>Z:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.pos?.z}
            onChange={e => camPos.current = {x: camPos.current.x, y: camPos.current.y, z: e.currentTarget.valueAsNumber}}
          />
        </div>
      </div>
      <p className="font-poppins font-medium text-purple pt-4 px-2">Camera look at:</p>
      <div className="flex gap-4 px-2 pb-2">
        <div className="flex items-center gap-2">
          <p>X:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.lookAt?.x}
            onChange={e => camLookAt.current = {x: e.currentTarget.valueAsNumber, y: camLookAt.current.y, z: camLookAt.current.z}}
          />
        </div>
        <div className="flex items-center gap-2">
          <p>Y:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.lookAt?.y}
            onChange={e => camLookAt.current = {x: camLookAt.current.x, y: e.currentTarget.valueAsNumber, z: camLookAt.current.z}}
          />
        </div>
        <div className="flex items-center gap-2">
          <p>Z:</p>
          <input
            type="number"
            className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
            defaultValue={camConfig?.lookAt?.z}
            onChange={e => camLookAt.current = {x: camLookAt.current.x, y: camLookAt.current.y, z: e.currentTarget.valueAsNumber}}
          />
        </div>
      </div>
      <div className="mx-2">
        <AGButton nm full onClickEvent={() => sendNewCamConfig()}>
          <p className="py-2">Update</p>
        </AGButton>
      </div>
    </div>
  )
}