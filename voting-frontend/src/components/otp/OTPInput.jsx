import { useRef } from 'react';

export default function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = char;
    onChange(arr.join(''));
    if (char && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!value[i] && i > 0) {
        const arr = value.split('');
        arr[i - 1] = '';
        onChange(arr.join(''));
        inputs.current[i - 1]?.focus();
      } else {
        const arr = value.split('');
        arr[i] = '';
        onChange(arr.join(''));
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold font-mono
            bg-slate-900 border-2 border-slate-600 rounded-xl text-white
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            transition-all caret-transparent selection:bg-transparent"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
