import { AddCommentForm } from "../components/form/AddCommentForm";

export function AddCommentSection() {
  return (
    <div className="w-full lg:w-[900px] bg-gray-300 bg-opacity-35 grid grid-cols-1 m-auto my-4">
      <h1 className="font-serif text-md lg:text-xl ml-4 lg:ml-8 mt-4">
        Add your comment
      </h1>
      <AddCommentForm />
    </div>
  );
}
