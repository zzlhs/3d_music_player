import { useState, useCallback } from 'react';
import type { ScannedTrack } from '../types';

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemFileHandle>;
    getFileHandle(name: string): Promise<FileSystemFileHandle>;
  }
  interface FileSystemFileHandle {
    getFile(): Promise<File>;
    name: string;
  }
}

export type FolderPickerError =
  | 'unsupported'
  | 'aborted'
  | 'permission'
  | 'unknown';

export function useMusicFolder() {
  const [tracks, setTracks] = useState<ScannedTrack[]>([]);
  const [folderName, setFolderName] = useState<string>('');
  const [error, setError] = useState<FolderPickerError | null>(null);

  const supported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const pickFolder = useCallback(async () => {
    setError(null);

    if (!supported) {
      setError('unsupported');
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      setFolderName(dirHandle.name);

      const found: ScannedTrack[] = [];

      for await (const entry of dirHandle.values()) {
        if (entry.kind !== 'file') continue;

        const name = entry.name;
        if (!name.toLowerCase().endsWith('.mp3')) continue;

        const baseName = name.replace(/\.mp3$/i, '');
        const lrcFileName = baseName + '.lrc';

        let lyricHandle: FileSystemFileHandle | undefined;
        try {
          lyricHandle = await dirHandle.getFileHandle(lrcFileName);
        } catch {
          // LRC file not found, that's ok
        }

        found.push({
          id: baseName,
          title: baseName,
          audioHandle: entry,
          lyricHandle,
        });
      }

      found.sort((a, b) => a.title.localeCompare(b.title));
      setTracks(found);
    } catch (err) {
      const domErr = err as DOMException;
      if (domErr.name === 'AbortError') {
        setError('aborted');
        return;
      }
      if (domErr.name === 'SecurityError' || domErr.name === 'NotAllowedError') {
        setError('permission');
      } else {
        setError('unknown');
      }
      console.error('Folder picker error:', err);
    }
  }, [supported]);

  return { tracks, folderName, error, supported, pickFolder };
}
