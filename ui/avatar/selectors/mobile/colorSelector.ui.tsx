import 'swiper/css';
import AGButton from '../../../common/ag-button.component';
import ColorItemUI from './colorItem.ui';

interface ColorSelectorUIProps {
  list?: string[];
  activeColor?: string;
  handleChangeColor: (color: string) => void;
  handleSwitchShowColorSelector: () => void;
}

export default function ColorSelectorUI({ list, activeColor, handleChangeColor, handleSwitchShowColorSelector }: ColorSelectorUIProps) {
  return (
    <div className='w-full relative fix top-0 left-0 h-screen flex justify-center items-center'>
      <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-30' onClick={() => { handleSwitchShowColorSelector() }} />
      <div className='w-[80vw] h-[70vh] bg-bg rounded-2xl z-10 flex flex-col justify-around items-stretch'>
        <h2 className='w-full text-center text-3xl text-gray-normal font-poppins'>SKIN COLOR</h2>
        <div className='w-full flex flex-wrap justify-center gap-3'>
          {list &&
            list.map((color, index) => <ColorItemUI key={index} color={color} isActive={(activeColor == color)} handleChangeColor={(color) => handleChangeColor(color)} />)
          }
          {/* TODO: if list don't exist, show full custom rgb modal */}
        </div>
        <div className='flex w-full justify-center'>
          <AGButton nm onClickEvent={() => { handleSwitchShowColorSelector() }}>
            <p>OK</p>
          </AGButton>
          <AGButton nm onClickEvent={() => { handleSwitchShowColorSelector() }}>
            <p>CANCEL</p>
          </AGButton>
        </div>
      </div>
    </div>
  )
}