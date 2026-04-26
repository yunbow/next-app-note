export default function NoteDetailLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="mb-2 h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
