"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  defaultValue?: string;
}

interface Suggestion {
  title: string;
  slug: string;
  image: string;
  date: string;
}

const SUGGESTIONS_DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;

const SearchBar = ({
  onSearch,
  placeholder = "Search events, tags, or location...",
  debounceMs = 250,
  defaultValue = "",
}: SearchBarProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keep the latest onSearch without making it a dependency of the debounce
  // effect below - avoids restarting the timer on every parent re-render.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Skip the very first run - defaultValue already matches the current URL,
  // so firing onSearch on mount would just re-push the same URL.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onSearchRef.current(value.trim());
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, debounceMs]);

  // Separate, snappier debounce for the typeahead dropdown - decoupled from
  // the full-grid search above, since one shouldn't have to wait on the other.
  useEffect(() => {
    const trimmed = value.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/events/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setSuggestions(data.suggestions ?? []);
        setShowSuggestions(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to fetch suggestions:", error);
        }
      }
    }, SUGGESTIONS_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/events/${slug}`);
  };

  const visibleSuggestions =
    value.trim().length >= MIN_QUERY_LENGTH ? suggestions : [];

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
      <label htmlFor="event-search" className="sr-only">
        Search events
      </label>
      <input
        id="event-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => visibleSuggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setShowSuggestions(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
      />

      {showSuggestions && visibleSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-dark-200 bg-dark-100 shadow-lg">
          {visibleSuggestions.map((suggestion) => (
            <li key={suggestion.slug}>
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion.slug)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-dark-200"
              >
                <Image
                  src={suggestion.image}
                  alt={suggestion.title}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="line-clamp-1 text-sm font-medium">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-gray-400">{suggestion.date}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
