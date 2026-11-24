export default function Loader({ label = "Loading page…" }: { label?: string }) {
  return (
    <div className="md-loader" role="status">
      <span>{label}</span>
      <div aria-hidden="true" />
      <div aria-hidden="true" />
    </div>
  );
}
