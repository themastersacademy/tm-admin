"use client";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

const SubjectContext = createContext();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const CACHE_DURATION = 25 * 60 * 1000; // 25 minutes

export const SubjectProvider = ({ children }) => {
  const [subjectList, setSubjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);
  const router = useRouter();

  const fetchSubject = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();
      const cachedData =
        JSON.parse(localStorage.getItem("subjectsCache")) || {};
      const { subjects = [], timestamp = 0 } = cachedData;

      if (
        !forceRefresh &&
        now - timestamp < CACHE_DURATION &&
        subjects.length > 0
      ) {
        setSubjectList(subjects);
        setCacheTimestamp(timestamp);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/subjects/get-all-subjects`,
          {
            credentials: "include",
          }
        );

        if (response.status === 401) {
          console.warn("Session expired, redirecting to login...");
          setHasSessionExpired(true);
          return;
        }

        const data = await response.json();
        const fetchedSubjects = data.success ? data.data.subjects : [];

        setSubjectList(fetchedSubjects);
        setCacheTimestamp(now);
        localStorage.setItem(
          "subjectsCache",
          JSON.stringify({ subjects: fetchedSubjects, timestamp: now })
        );
      } catch (error) {
        console.error("Fetch error:", error);
        setSubjectList([]);
        setCacheTimestamp(null);
      } finally {
        setIsLoading(false);
      }
    },
    [BASE_URL]
  );

  useEffect(() => {
    const cachedData = JSON.parse(localStorage.getItem("subjectsCache")) || {};
    if (cachedData.subjects) setSubjectList(cachedData.subjects);
    if (cachedData.timestamp) setCacheTimestamp(cachedData.timestamp);
    fetchSubject();
  }, [fetchSubject]);

  useEffect(() => {
    if (hasSessionExpired) {
      // Clear cache and navigate to login
      localStorage.removeItem("subjectsCache");
      router.push("/login");
    }
  }, [hasSessionExpired, router]);

  const contextValue = useMemo(
    () => ({
      subjectList,
      fetchSubject,
      isLoading,
      cacheTimestamp,
    }),
    [subjectList, fetchSubject, isLoading, cacheTimestamp]
  );

  return (
    <SubjectContext.Provider value={contextValue}>
      {children}
    </SubjectContext.Provider>
  );
};

export default SubjectContext;
