"use client";
import React, { createContext, useContext, useMemo, useCallback } from "react";
import useSWR from "swr";

// GET fetcher for GET endpoints
const getFetcher = (url) =>
  fetch(url, {
    method: "GET",
  }).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  });

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const {
    data: courseRes,
    error: courseErr,
    isLoading,
    mutate,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/course/get-all`,
    getFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Derive only titles and thumbnails
  const courseDetails = useMemo(() => {
    // console.log("🚨 courseRes:", courseRes);
    if (courseErr) return [];
    return (
      courseRes?.data?.map((c) => {
        const firstPlan = c.subscription.plans?.[0] || {};
        return {
          courseID: c.courseID,
          title: c.title,
          thumbnail: c.thumbnail,
          duration: c.duration,
          lessons: c.lessons,
          type: firstPlan.type,
          price: firstPlan.priceWithTax,
        };
      }) || []
    );
  }, [courseRes, courseErr]);

  // Helper: get course details by ID
  const getCourseDetails = useCallback(
    (courseID) => {
      const raw = courseRes?.data?.find((c) => c.courseID === courseID);
      if (!raw) return null;
      const firstPlan = raw.subscription?.plans?.[0] || {};
      return {
        courseID: raw.courseID,
        title: raw.title,
        thumbnail: raw.thumbnail,
        duration: raw.duration,
        lessons: raw.lessons,
        type: firstPlan.type || null,
        price: firstPlan.priceWithTax || null,
      };
    },
    [courseDetails]
  );

  const contextValue = useMemo(
    () => ({
      courseDetails,
      getCourseDetails,
      loading: isLoading,
      refetch: mutate,
    }),
    [courseDetails, getCourseDetails, isLoading, mutate]
  );

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context)
    throw new Error("useCourses must be used within a CourseProvider");
  return context;
}
