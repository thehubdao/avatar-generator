interface AGButtonProps {
  type?: 'primary' | 'secondary' | 'alert' | 'danger';
  align?: 'center' | 'start' | 'end';
  onClickEvent?: () => void;
  children?: string | JSX.Element;
  form?: boolean;
  tooltip?: string;
}

interface AGButtonState {
  color: string;
  borderColor: string;
  textColor: string;
  hover: string;
  side: string;
}

export default function AGButton({type, align, form, onClickEvent, tooltip, children}: AGButtonProps) {
  const vD: AGButtonState = {
    ...getBtnType(),
    side: getSide()
  };

  function getBtnType() {
    switch (type) {
      case 'secondary':
        return {
          color: 'bg-teal-600',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
          hover: 'hover:bg-teal-500'
        };
      case 'alert':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
          hover: 'hover:bg-yellow-400'
        };
      case 'danger':
        return {
          color: 'bg-rose-600',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
          hover: 'hover:bg-rose-500'
        };
      default:
        // primary
        return {
          color: 'bg-slate-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-600',
          hover: 'hover:bg-slate-200'
        };
    }
  }

  function getSide() {
    switch (align) {
      case "start":
        return "justify-start";
      case "end":
        return "justify-end";
      default:
        return "justify-center";
    }
  }

  return (
    <div className={`my-2 flex ${vD.side ?? ''}`}>
      {
        form ?
          <button type="submit"
                  className={`mx-2 w-auto my-auto rounded py-1 border-1 ${vD.hover} ${vD.textColor} ${vD.color} ${vD.borderColor}`}
                  onClick={onClickEvent} title={tooltip}>
            <div className='px-4'>{children}</div>
          </button>
          :
          <div
            className={`mx-2 w-auto min-w-[70px] my-auto rounded py-1 border-1 cursor-pointer ${vD.hover} ${vD.textColor} ${vD.color} ${vD.borderColor}`}
            onClick={onClickEvent} title={tooltip}>
            <div className='px-2'>{children}</div>
          </div>
      }
    </div>
  );
}
