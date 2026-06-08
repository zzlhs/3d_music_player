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

export function useMusicFolder() {
  const [tracks, setTracks] = useState<ScannedTrack[]>([]);
  const [folderName, setFolderName] = useState<string>('');

  const pickFolder = useCallback(async () => {
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
      if ((err as DOMException).name === 'AbortError') return;
      console.error('Folder picker error:', err);
    }
  }, []);

  return { tracks, folderName, pickFolder };
}
