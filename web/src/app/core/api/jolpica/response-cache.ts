import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

const STORAGE_PREFIX = 'saba.jolpica.cache.v1:';

interface Entry<T> {
  readonly expiresAt: number;
  readonly value: T;
}

/**
 * Time-limited cache kept in memory and mirrored in localStorage, so reloading
 * the page does not spend the API quota again. Storage failures are tolerated.
 */
@Injectable({ providedIn: 'root' })
export class ResponseCache {
  private readonly memory = new Map<string, Entry<unknown>>();
  private readonly storage = findStorage(inject(DOCUMENT));

  constructor() {
    this.removeExpiredStoredEntries();
  }

  get<T>(key: string): T | undefined {
    const now = Date.now();
    const entry = this.memory.get(key) ?? this.readStored(key);

    if (entry && entry.expiresAt > now) {
      this.memory.set(key, entry);
      return entry.value as T;
    }
    if (entry) {
      this.memory.delete(key);
      this.removeStored(key);
    }
    return undefined;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const entry: Entry<T> = { expiresAt: Date.now() + ttlMs, value };
    this.memory.set(key, entry);
    try {
      this.storage?.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage may be full or blocked; the entry then lives in memory only.
    }
  }

  private readStored(key: string): Entry<unknown> | undefined {
    try {
      const raw = this.storage?.getItem(STORAGE_PREFIX + key);
      const entry = raw ? (JSON.parse(raw) as Entry<unknown>) : undefined;
      return isEntry(entry) ? entry : undefined;
    } catch {
      return undefined;
    }
  }

  private removeStored(key: string): void {
    try {
      this.storage?.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }

  private removeExpiredStoredEntries(): void {
    const storage = this.storage;
    if (!storage) {
      return;
    }
    try {
      const now = Date.now();
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
        (key): key is string => key?.startsWith(STORAGE_PREFIX) ?? false,
      );
      for (const storageKey of keys) {
        const key = storageKey.slice(STORAGE_PREFIX.length);
        const entry = this.readStored(key);
        if (!entry || entry.expiresAt <= now) {
          storage.removeItem(storageKey);
        }
      }
    } catch {
      // Cleaning is best effort.
    }
  }
}

function findStorage(document: Document): Storage | null {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}

function isEntry(value: unknown): value is Entry<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Entry<unknown>).expiresAt === 'number' &&
    'value' in value
  );
}
