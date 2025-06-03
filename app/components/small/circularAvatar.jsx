export default function CircularAvatar({ id, className }) {
  return (
    <div className={`bg-green-500 w-10 h-10 rounded-full flex items-center justify-center ${className}`}>
      <h3 className="text-white">{id}</h3>
    </div>
  );
}
