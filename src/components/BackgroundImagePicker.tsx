import { useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useObjectUrl } from '../hooks/useObjectUrl';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function BackgroundImagePicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setBackgroundImageUrl = usePlayerStore((s) => s.setBackgroundImageUrl);
  const backgroundImageUrl = usePlayerStore((s) => s.backgroundImageUrl);
  const { createUrl, revokeUrl } = useObjectUrl();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('仅支持 JPG/PNG/WebP 格式的图片');
      return;
    }

    const url = createUrl(file);
    setBackgroundImageUrl(url);
  };

  const handleRemove = () => {
    if (backgroundImageUrl) {
      revokeUrl();
      setBackgroundImageUrl(null);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">背景图片</label>
      <div className="flex gap-2">
        <button
          className="flex-1 bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 hover:border-blue-500 text-sm"
          onClick={() => inputRef.current?.click()}
        >
          {backgroundImageUrl ? '更换图片' : '上传图片'}
        </button>
        {backgroundImageUrl && (
          <button
            className="bg-red-900/50 text-red-300 rounded px-3 py-2 text-sm hover:bg-red-800/50"
            onClick={handleRemove}
          >
            移除
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {backgroundImageUrl && (
        <p className="text-xs text-green-400 mt-1">✓ 已选择背景图片</p>
      )}
    </div>
  );
}
