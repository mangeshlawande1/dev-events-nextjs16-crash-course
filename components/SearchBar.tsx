"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar = ({
  onSearch,
  placeholder = "Search events, tags, or location...",
  debounceMs = 250,
}: SearchBarProps) => {
  const [value, setValue] = useState("");

  // Keep the latest onSearch without making it a dependency of the debounce
  // effect below - avoids restarting the timer on every parent re-render.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchRef.current(value.trim());
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, debounceMs]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <label htmlFor="event-search" className="sr-only">
        Search events
      </label>
      <input
        id="event-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
      />
    </div>
  );
};

export default SearchBar;
