export function ErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  const message = (error && typeof error === 'object' && 'message' in error)
    ? String((error as any).message)
    : 'Something went wrong.';
  return (
    <div style={{ padding: 24 }}>
      <h3>Unexpected error</h3>
      <p>{message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}


