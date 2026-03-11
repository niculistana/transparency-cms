import { Check } from "lucide-react";

export const SubmitButton = () => {
  return (
    <button className="font-serif" type="submit">
      <span className="ml-2 float-right">
        <Check></Check>
      </span>
      Submit
    </button>
  );
};
