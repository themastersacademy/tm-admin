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
    if (courseErr) return [];
    return (
      courseRes?.data?.map((c) => ({
        courseID: c.courseID,
        title: c.title,
        thumbnail: c.thumbnail,
        duration: c.duration,
        lessons: c.lessons,
        type: c.subscription.plans[0].type,
        price: c.subscription.plans[0].priceWithTax,
      })) || []
    );
  }, [courseRes, courseErr]);

  // Helper: get course details by ID
  const getCourseDetails = useCallback(
    (courseID) => {
      const course = courseDetails.find((c) => c.courseID === courseID);
      return course
        ? {
            title: course.title,
            thumbnail: course.thumbnail,
            courseID: course.courseID,
            duration: course.duration,
            lessons: course.lessons,
            type: course.subscription.plans[0].type,
            price: course.subscription.plans[0].priceWithTax,
          }
        : null;
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
