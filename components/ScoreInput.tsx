interface ScoreInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function ScoreInput({ label, name, value, onChange, placeholder }: ScoreInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step="0.1"
        min="0"
        max="10"
        required
        className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zpath-primary outline-none transition-all"
      />
    </div>
  );
}