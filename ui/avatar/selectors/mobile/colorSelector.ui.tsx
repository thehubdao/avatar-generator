import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { MouseEvent } from "react";
import AGButton from '../../../common/ag-button.component';

// REFERENCE PALETTE: https://www.colourlovers.com/palette/2543931/Cartoon_Skin_2

interface ColorSelectorComponentProps {
  list: string[];
  activeColor: string | undefined;
  handleChangeColor: (color: string) => void;
  handleSwitchShowColorSelector: () => void;
}

interface OptionListProps extends Omit<ColorSelectorComponentProps, 'handleSwitchShowColorSelector'> { };

function OptionList(props: OptionListProps) {
  function selectFeature(e: MouseEvent, color: string) {
    e.preventDefault();
    props.handleChangeColor(color);
  }

  return props.list.map((opt) => {
    return (
      <div
        className={'cursor-pointer rounded-md transition duration-200 ease-in-out w-[50px] h-[50px] flex items-center justify-center mx-3 ' + (props.activeColor == opt ? 'shadow-inset-medium' : 'shadow-flat-medium')}
        onClick={(event: MouseEvent) => selectFeature(event, opt)}
        key={opt}
      >
        <div className='w-4/6 h-4/6 rounded-md' style={{ backgroundColor: ('#' + opt) }}></div>
      </div>
    )
  });
}

export default function ColorSelectorComponent(props: ColorSelectorComponentProps) {
  return (
    <div className='w-full relative fix top-0 left-0 h-screen flex justify-center items-center'>
      <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-30' onClick={() => { props.handleSwitchShowColorSelector() }} />
      <div className='w-[80vw] h-[70vh] bg-bg rounded-2xl z-10 flex flex-col justify-around items-stretch'>
        <h2 className='w-full text-center text-3xl text-gray-normal font-poppins'>SKIN COLOR</h2>
        <div className='w-full flex flex-wrap justify-center gap-3'>
          {OptionList(props)}
        </div>
        <div className='flex w-full justify-center'>
          <AGButton nm onClickEvent={() => { props.handleSwitchShowColorSelector() }}>
            <p>OK</p>
          </AGButton>
          <AGButton nm onClickEvent={() => { props.handleSwitchShowColorSelector() }}>
            <p>CANCEL</p>
          </AGButton>
        </div>
      </div>
    </div>
  )
}