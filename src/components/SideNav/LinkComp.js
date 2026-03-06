"use client";
import { ExpandMore } from "@mui/icons-material";
import { Stack, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import goals from "@/public/Icons/Goals.svg";
import library from "@/public/Icons/Library.svg";
import institute from "@/public/Icons/Institute.svg";
import students from "@/public/Icons/Students.svg";
import payments from "@/public/Icons/rupee.svg";

export default function LinkComp({ isSideNavOpen, sideNavOpen }) {
  return (
    <Stack
      sx={{
        gap: "4px",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          width: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(24, 113, 99, 0.2)",
          borderRadius: "10px",
        },
      }}
    >
      <NavComp
        icon={goals.src}
        title="Goals"
        href="/"
        isSideNavOpen={isSideNavOpen}
        isRoot={true}
      />
      <NavComp
        icon={goals.src}
        title="Home Page"
        href="/dashboard/homepage"
        isSideNavOpen={isSideNavOpen}
      />
      <NavComp
        icon={library.src}
        title="Library"
        href="#"
        list={[
          { title: "Course Bank", href: "/dashboard/library/coursebank" },
          { title: "All Questions", href: "/dashboard/library/allQuestions" },
          { title: "All Subjects", href: "/dashboard/library/allSubjects" },
        ]}
        isSideNavOpen={isSideNavOpen}
        sideNavOpen={sideNavOpen}
      />
      <NavComp
        icon={institute.src}
        title="Academy"
        href="#"
        list={[
          { title: "Schedule Test", href: "/dashboard/scheduleTest" },
          { title: "Institute", href: "/dashboard/institute" },
        ]}
        isSideNavOpen={isSideNavOpen}
        sideNavOpen={sideNavOpen}
      />
      <NavComp
        icon={students.src}
        title="Students"
        href="/dashboard/students"
        isSideNavOpen={isSideNavOpen}
      />
      <NavComp
        icon={payments.src}
        title="Payments & Coupons"
        href="/dashboard/payments"
        isSideNavOpen={isSideNavOpen}
      />
    </Stack>
  );
}

const NavComp = ({
  icon,
  title,
  list,
  href,
  isSideNavOpen,
  sideNavOpen,
  isRoot,
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();
  const isParentActive = isRoot
    ? pathname === "/dashboard" || pathname.startsWith("/dashboard/goals")
    : pathname === href || pathname.startsWith(href + "/");
  const isChildActive = list?.some((item) => pathname.startsWith(item.href));
  const isActive = isParentActive || isChildActive;

  const toggleLibrary = () => {
    setIsNavOpen((prev) => !prev);
    if (!isNavOpen && sideNavOpen) {
      sideNavOpen();
    }
  };

  useEffect(() => {
    if (isSideNavOpen) {
      setIsNavOpen(false);
    } else {
      setIsNavOpen(true);
    }
  }, [isSideNavOpen]);

  return (
    <Stack>
      <Tooltip
        title={title}
        disableHoverListener={!isSideNavOpen}
        placement="right"
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "var(--text1)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: "6px",
            },
          },
        }}
      >
        <Stack
          sx={{
            padding: isSideNavOpen ? "6px" : "6px 10px",
            cursor: "pointer",
            alignItems: isSideNavOpen ? "center" : "flex-start",
            backgroundColor: isActive
              ? "rgba(24, 113, 99, 0.06)"
              : "transparent",
            borderRadius: "8px",
            position: "relative",
            "&:hover": {
              backgroundColor:
                list && isNavOpen
                  ? "transparent"
                  : "rgba(24, 113, 99, 0.06)",
            },
            "&::before": isActive
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3px",
                  height: "50%",
                  backgroundColor: "var(--primary-color)",
                  borderRadius: "0 3px 3px 0",
                }
              : {},
          }}
        >
          <Link href={href || ""} passHref style={{ width: "100%" }}>
            <Stack
              flexDirection="row"
              alignItems="center"
              onClick={toggleLibrary}
              gap={isSideNavOpen ? 0 : "10px"}
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" gap="10px">
                <Stack
                  sx={{
                    width: "34px",
                    height: "34px",
                    backgroundColor: isActive
                      ? "rgba(24, 113, 99, 0.1)"
                      : "rgba(24, 113, 99, 0.06)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={icon}
                    alt={title}
                    width={18}
                    height={18}
                    style={{
                      filter: isActive
                        ? "brightness(0) saturate(100%)"
                        : "none",
                    }}
                  />
                </Stack>
                {!isSideNavOpen && (
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "var(--primary-color)"
                        : "var(--text1)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Stack>
              {list && !isSideNavOpen && (
                <ExpandMore
                  sx={{
                    color: isActive
                      ? "var(--primary-color)"
                      : "var(--text3)",
                    fontSize: "18px",
                    transform: isNavOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              )}
            </Stack>
          </Link>
          <Stack>
            {isNavOpen && list && (
              <Stack
                sx={{
                  pl: isSideNavOpen ? 0 : "44px",
                  mt: "4px",
                  gap: "2px",
                }}
              >
                {list.map((item, index) => (
                  <Link href={item.href} key={index} passHref>
                    <Stack
                      sx={{
                        fontSize: "12px",
                        fontWeight: pathname.startsWith(item.href) ? 700 : 500,
                        color: pathname.startsWith(item.href)
                          ? "var(--primary-color)"
                          : "var(--text2)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        backgroundColor: pathname.startsWith(item.href)
                          ? "rgba(24, 113, 99, 0.06)"
                          : "transparent",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(24, 113, 99, 0.06)",
                        },
                      }}
                    >
                      {item.title}
                    </Stack>
                  </Link>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Tooltip>
    </Stack>
  );
};
