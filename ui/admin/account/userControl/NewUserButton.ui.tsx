import AGButton from "../../../common/ag-button.component";

//** Represents the props for the NewUserButton component.
interface NewUserButtonProps {
  label: string;
  handleEvent: () => void;
  form?: boolean;
}

/**
 ** Represents a button component for adding or canceling a new user.
 * @param {NewUserButtonProps} props - The props for the NewUserButton component.
 */
export default function NewUserButtonUI({ label, handleEvent, form }: NewUserButtonProps) {
  return (
    <div className="w-1/2">
      <AGButton full form={form} nm onClickEvent={() => { handleEvent(); }}>
        <p className="text-gray-normal py-1">{label}</p>
      </AGButton>
    </div>
  );
};