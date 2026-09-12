"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// A single form's `pending` state from useFormStatus is shared across every
// submitter inside it, so with two buttons (Save/Delete) we still need to
// track which one was actually clicked to label the right one correctly.
export function SaveDeleteButtons({
  onSave,
  onDelete,
  saveLabel = "Save",
  deleteLabel = "Delete",
  savingLabel = "Saving…",
  deletingLabel = "Deleting…",
  saveClassName,
  deleteClassName,
}: {
  onSave: (formData: FormData) => void | Promise<void>;
  onDelete: (formData: FormData) => void | Promise<void>;
  saveLabel?: string;
  deleteLabel?: string;
  savingLabel?: string;
  deletingLabel?: string;
  saveClassName: string;
  deleteClassName: string;
}) {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState<"save" | "delete" | null>(null);

  return (
    <>
      <button
        type="submit"
        formAction={onSave}
        onClick={() => setClicked("save")}
        disabled={pending}
        className={`${saveClassName} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending && clicked === "save" ? savingLabel : saveLabel}
      </button>
      <button
        type="submit"
        formAction={onDelete}
        onClick={() => setClicked("delete")}
        disabled={pending}
        className={`${deleteClassName} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending && clicked === "delete" ? deletingLabel : deleteLabel}
      </button>
    </>
  );
}
