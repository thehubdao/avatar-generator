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
          color: 'bg-sky-600',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
          hover: 'hover:bg-sky-500'
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
            <span className='px-4'>{children}</span>
          </button>
          :
          <div
            className={`mx-2 w-auto my-auto rounded py-1 border-1 cursor-pointer ${vD.hover} ${vD.textColor} ${vD.color} ${vD.borderColor}`}
            onClick={onClickEvent} title={tooltip}>
            <span className='px-4'>{children}</span>
          </div>
      }
    </div>
  );
}
