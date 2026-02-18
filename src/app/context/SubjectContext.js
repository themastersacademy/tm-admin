"use client";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";

const SubjectContext = createContext();

const CACHE_KEY = "tma_subjects_cache_v3";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Remove stale caches from old key names
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("tma_subjects_cache");
  } catch {}
  try {
    localStorage.removeItem("tma_subjects_cache_v2");
  } catch {}
}

/** Read subjects from localStorage. Returns null if missing, expired, or empty. */
function readCache() {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    // Never serve an empty cached list — treat it as a miss so we re-fetch
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

/** Write subjects to localStorage with a timestamp. Never caches an empty list. */
function writeCache(data) {
  try {
    if (typeof window === "undefined") return;
    if (!Array.isArray(data) || data.length === 0) return; // never cache empty
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded) — ignore
  }
}

/** Remove the subjects cache (call after create/delete/update subject). */
export function clearSubjectCache() {
  try {
    if (typeof window !== "undefined") localStorage.removeItem(CACHE_KEY);
  } catch {}
}

export const SubjectProvider = ({ children }) => {
  // Initialise from cache synchronously so the first render already has data
  const [subjectList, setSubjectList] = useState(() => readCache() ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Request deduplication: prevent duplicate concurrent API calls
  const fetchPromiseRef = useRef(null);

  const fetchSubject = useCallback(async (forceRefresh = false) => {
    // Skip fetching if on login page to prevent 401 loops
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/login"
    ) {
      return;
    }

    // Return cached data if still fresh and not forcing a refresh
    if (!forceRefresh) {
      const cached = readCache();
      if (cached) {
        setSubjectList(cached);
        setIsLoading(false);
        return;
      }
    }

    // If already fetching, reuse the in-flight promise
    if (fetchPromiseRef.current && !forceRefresh) {
      return fetchPromiseRef.current;
    }

    fetchPromiseRef.current = (async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/subjects/get-all-subjects`,
        );

        if (data?.success) {
          const subjects = data.data.subjects;
          setSubjectList(subjects);
          writeCache(subjects);
        } else {
          setSubjectList([]);
        }
      } catch (error) {
        console.error("Fetch subjects error:", error);
        // Keep stale cache rather than wiping the list on a transient error
        const stale = readCache();
        if (stale) setSubjectList(stale);
      } finally {
        setIsLoading(false);
      }
    })();

    try {
      await fetchPromiseRef.current;
    } finally {
      fetchPromiseRef.current = null;
    }
  }, []);

  // Fetch on mount (will use cache if fresh)
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const contextValue = useMemo(
    () => ({
      subjectList,
      fetchSubject,
      isLoading,
    }),
    [subjectList, fetchSubject, isLoading],
  );

  return (
    <SubjectContext.Provider value={contextValue}>
      {children}
    </SubjectContext.Provider>
  );
};

export default SubjectContext;
