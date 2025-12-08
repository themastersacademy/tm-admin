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

export const SubjectProvider = ({ children }) => {
  const [subjectList, setSubjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);
  const router = useRouter();

  // Request deduplication: prevent duplicate concurrent API calls
  const fetchPromiseRef = useRef(null);

  const fetchSubject = useCallback(async (forceRefresh = false) => {
    // If already fetching and not forcing refresh, return existing promise
    if (fetchPromiseRef.current && !forceRefresh) {
      return fetchPromiseRef.current;
    }

    fetchPromiseRef.current = (async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || ""
          }/api/subjects/get-all-subjects`
        );

        if (data.success) {
          setSubjectList(data.data.subjects);
        } else {
          setSubjectList([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setSubjectList([]);
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

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  // Handle session expiration
  useEffect(() => {
    if (hasSessionExpired) {
      router.push("/login");
    }
  }, [hasSessionExpired, router]);

  const contextValue = useMemo(
    () => ({
      subjectList,
      fetchSubject,
      isLoading,
    }),
    [subjectList, fetchSubject, isLoading]
  );

  return (
    <SubjectContext.Provider value={contextValue}>
      {children}
    </SubjectContext.Provider>
  );
};

export default SubjectContext;
