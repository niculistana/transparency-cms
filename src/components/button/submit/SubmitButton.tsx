import { Check } from "lucide-react";

export const SubmitButton = () => {
  return (
    <button
      className={`px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
      type="submit"
    >
      <span className="ml-2 float-right">
        <Check></Check>
      </span>
      Submit
    </button>
  );
};
