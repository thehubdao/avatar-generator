interface AGButtonProps {
  type?: 'primary' | 'secondary' | 'alert' | 'danger';
  align?: 'center' | 'start' | 'end';
  onClickEvent?: () => void;
  children?: string | JSX.Element;
  form?: boolean;
  nm?: boolean;
  selected?: boolean;
  fit?: boolean;
  full?: boolean;
  circle?: boolean;
  tooltip?: string;
}

// **Represents the state of the AGButton component.
interface AGButtonState {
  color: string;
  borderColor: string;
  textColor: string;
  hover: string;
  side: string;
}

/**
 ** AGButton is a customizable button component.
 * @param type - The type of the button.
 * @param align - The alignment of the button content.
 * @param {Function} onClickEvent - The click event handler for the button.
 * @param children - The content of the button - it can be a string or a JSX element.
 * @param {boolean} form - Indicates if the button is part of a form.
 * @param {boolean} nm - Indicates whether the button uses the neomorphism style.
 * @param {boolean} selected - Indicates if the button is selected.
 * @param {boolean} fit - Indicates whether the button should fit its content width.
 * @param {boolean} full - Indicates whether the button should take up the full width.
 * @param {boolean} circle - Indicates whether the button should be displayed as a circle.
 * @param {string} tooltip - The tooltip text for the button.
 * 
 * @returns The Avatar Generator Button as a tsx component.
 */

export default function AGButton({ type, align, form, nm, selected, fit, full, circle, onClickEvent, tooltip, children }: AGButtonProps) {
  const vD: AGButtonState = {
    ...getBtnType(),
    side: getSide()
  };

  /**
   ** Retrieves the button type styles based on the specified type.
   * @returns The button type styles.
   */
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
          hover: nm ? 'hover:shadow-flat-medium' : 'hover:bg-slate-200'
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
      <button type={form ? 'submit' : undefined}
        className={`mx-2 w-auto min-h-[32px] my-auto rounded py-1 border-1 ${vD.hover} ${vD.textColor} ${vD.color} ${vD.borderColor} ${nm ? 'shadow-flat-soft rounded-lg' : ''} ${nm && selected ? '!shadow-inset-soft rounded-lg' : ''} ${fit ? 'w-fit' : 'min-w-[100px]'} ${full ? '!w-full mx-0' : ''} ${circle ? 'rounded-full' : ''} transition-all duration-300`}
        onClick={onClickEvent} title={tooltip}>
        <div className='px-2'>{children}</div>
      </button>
    </div>
  );
}
