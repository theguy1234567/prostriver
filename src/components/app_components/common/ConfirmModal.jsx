import React from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
        <h2 className="text-2xl font-averaiserif font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-gray-200 dark:bg-zinc-800 dark:text-white"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
