export default function NotesLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-6 dark:bg-gray-800"
          >
            <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
