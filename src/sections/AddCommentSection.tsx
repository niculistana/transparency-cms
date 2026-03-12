import { AddCommentForm } from "../components/form/AddCommentForm";

export type AddCommenSectionProps = {
  documentId?: number;
};

export function AddCommentSection({ documentId }: AddCommenSectionProps) {
  return (
    <div className="w-full bg-gray-300 bg-opacity-35 grid grid-cols-1 m-auto my-4">
      <h1 className="text-xl ml-4 lg:ml-8 mt-4 block text-sm font-semibold text-gray-700 mb-2 font-serif">
        Add your comment
      </h1>
      <AddCommentForm documentId={documentId} />
    </div>
  );
}
