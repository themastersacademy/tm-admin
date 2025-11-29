"use client";
import { ExpandMore } from "@mui/icons-material";
import { Stack, Tooltip, Typography, Chip } from "@mui/material";
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
        gap: "8px",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 152, 0, 0.2)",
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
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
      />
      <NavComp
        icon={goals.src}
        title="Home Page"
        href="/dashboard/homepage"
        isSideNavOpen={isSideNavOpen}
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
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
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
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
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
      />
      <NavComp
        icon={students.src}
        title="Students"
        href="/dashboard/students"
        isSideNavOpen={isSideNavOpen}
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
      />
      <NavComp
        icon={payments.src}
        title="Payments & Coupons"
        href="/dashboard/payments"
        isSideNavOpen={isSideNavOpen}
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.1)"
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
  color,
  bgColor,
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();
  const isParentActive = isRoot
    ? pathname === "/dashboard" || pathname.startsWith("/dashboard/goals")
    : pathname === href || pathname.startsWith(href + "/");
  const isChildActive = list?.some((item) => pathname.startsWith(item.href));

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
              fontSize: "13px",
              fontWeight: 600,
              padding: "8px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        <Stack
          sx={{
            minHeight: "48px",
            padding: isSideNavOpen ? "6px" : "8px 10px",
            cursor: "pointer",
            alignItems: isSideNavOpen ? "center" : "flex-start",
            background:
              isParentActive || isChildActive
                ? `linear-gradient(135deg, ${bgColor} 0%, ${color}15 100%)`
                : "transparent",
            borderRadius: "12px",
            border: `1.5px solid ${
              isParentActive || isChildActive ? color + "40" : "transparent"
            }`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              background:
                list && isNavOpen
                  ? "transparent"
                  : `linear-gradient(135deg, ${bgColor} 0%, ${color}15 100%)`,
              borderColor: color + "40",
            },
            "&::before":
              isParentActive || isChildActive
                ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "4px",
                    height: "60%",
                    backgroundColor: color,
                    borderRadius: "0 4px 4px 0",
                  }
                : {},
          }}
        >
          <Link href={href || ""} passHref style={{ width: "100%" }}>
            <Stack
              flexDirection="row"
              alignItems="center"
              onClick={toggleLibrary}
              gap={isSideNavOpen ? 0 : "12px"}
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" gap="12px">
                <Stack
                  sx={{
                    width: "40px",
                    height: "40px",
                    backgroundColor:
                      isParentActive || isChildActive ? color + "20" : bgColor,
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: `1.5px solid ${
                      isParentActive || isChildActive
                        ? color + "60"
                        : color + "30"
                    }`,
                    transition: "all 0.3s ease",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={icon}
                    alt={title}
                    width={20}
                    height={20}
                    style={{
                      filter:
                        isParentActive || isChildActive
                          ? "brightness(0) saturate(100%)"
                          : "none",
                    }}
                  />
                </Stack>
                {!isSideNavOpen && (
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "14px",
                      fontWeight: isParentActive || isChildActive ? 700 : 600,
                      color:
                        isParentActive || isChildActive
                          ? color
                          : "var(--text1)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Stack>
              {list && !isSideNavOpen && (
                <ExpandMore
                  sx={{
                    color:
                      isParentActive || isChildActive ? color : "var(--text3)",
                    fontSize: "20px",
                    transform: isNavOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              )}
            </Stack>
          </Link>
          <Stack>
            {isNavOpen && list && (
              <Stack
                sx={{
                  pl: isSideNavOpen ? 0 : "52px",
                  mt: "8px",
                  gap: "4px",
                  animation: "slideDown 0.3s ease",
                  "@keyframes slideDown": {
                    from: {
                      opacity: 0,
                      transform: "translateY(-10px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                {list.map((item, index) => (
                  <Link href={item.href} key={index} passHref>
                    <Stack
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: pathname.startsWith(item.href)
                          ? color
                          : "var(--text2)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        backgroundColor: pathname.startsWith(item.href)
                          ? bgColor
                          : "transparent",
                        border: `1px solid ${
                          pathname.startsWith(item.href)
                            ? color + "30"
                            : "transparent"
                        }`,
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: bgColor,
                          borderColor: color + "30",
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
