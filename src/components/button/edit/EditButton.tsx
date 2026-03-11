import { Pencil, X } from "lucide-react";

export const EditButton = ({
  onClick,
  text,
}: {
  onClick: Function;
  text: string;
}) => {
  return (
    <button
      className="font-serif"
      onClick={() => {
        onClick();
      }}
    >
      <span className="ml-2 float-right">
        {text === "Edit" && <Pencil></Pencil>}
        {text === "Cancel" && <X></X>}
      </span>
      {text}
    </button>
  );
};
