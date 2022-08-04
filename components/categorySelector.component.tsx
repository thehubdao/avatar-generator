import { BodyPartLocationApi } from "../interfaces/api.interface";
import {BasicData} from "../interfaces/common.interface";

interface ExampleProps {
  list: BodyPartLocationApi[] | BasicData[];
  handleClick: Function;
}

function optionList(props: ExampleProps) {
  return props.list.map((x) => {
    return (
      <div className="overflow-hidden w-16 h-16 flex justify-center flex-col items-center" key={x.id} onClick={() => {props.handleClick(x.id)}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path className="fill-gray-600" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
        </svg>
        <p className="text-[0.75rem]">{x.id}</p>
      </div>
    )
  });
}

function CategorySelectorComponent(props: ExampleProps) {
  return (
    <div className="w-20 bg-gray-200 border-2 border-gray-100 fixed top-4 right-4 rounded-[6px] drop-shadow-md flex flex-col items-center">
      <div className="overflow-hidden w-16 h-16 flex justify-center flex-col items-center border-b-2 border-solid border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path className="fill-gray-600" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
        </svg>
        <p className="text-[0.75rem]">features</p>
      </div>
      <div className="py-4">
        {optionList(props)}
      </div>
    </div>
  )
}

export { CategorySelectorComponent };