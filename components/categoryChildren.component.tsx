import { BodyPartLocationApi } from "../interfaces/api.interface";

interface ExampleProps {
  list: BodyPartLocationApi[];
  handleClick: Function;
}

function optionList(props: ExampleProps) {
  return props.list.map((x: BodyPartLocationApi) => {
    return (
      <div className="overflow-hidden w-20 h-20 flex justify-center flex-col items-center bg-gray-300 mx-2" key={x.id} onClick={() => {props.handleClick(x.id, x.path, x.name)}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path className="fill-gray-600" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
        </svg>
        <p className="text-[0.75rem]">{x.name}</p>
      </div>
    )
  });
}

function CategoryChildrenComponent(props: ExampleProps) {
  return (
    <div className="fixed bottom-0 right-0 w-screen h-[20%] flex flex-row justify-center items-center" >
      {optionList(props)}
    </div>
  )
}

export {CategoryChildrenComponent};