"use client";
import { useState } from "react";
import { Stack, Box, Typography } from "@mui/material";
import { Campaign, ViewCarousel, FeaturedPlayList } from "@mui/icons-material";
import HomePageHeader from "./components/HomePageHeader";
import BannerManagement from "./components/BannerManagement";
import FeaturedGoalsManagement from "./components/FeaturedGoalsManagement";
import AnnouncementsManagement from "./components/AnnouncementsManagement";

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = [
    {
      icon: <ViewCarousel />,
      label: "Home Banners",
      description: "Manage carousel images",
      color: "#2196F3",
    },
    {
      icon: <FeaturedPlayList />,
      label: "Featured Goals",
      description: "Highlight top goals",
      color: "#9C27B0",
    },
    {
      icon: <Campaign />,
      label: "Announcements",
      description: "Important messages",
      color: "#FF9800",
    },
  ];

  return (
    <Stack padding="20px" gap="24px" sx={{ minHeight: "100vh" }}>
      {/* Custom Header */}
      <HomePageHeader />

      {/* Main Content Card */}
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Custom Tabs */}
        <Stack
          direction="row"
          sx={{
            borderBottom: "2px solid var(--border-color)",
            padding: "16px 24px 0",
            gap: "8px",
            backgroundColor: "#FAFAFA",
          }}
        >
          {tabs.map((tab, index) => (
            <Stack
              key={index}
              onClick={() => setCurrentTab(index)}
              sx={{
                padding: "14px 20px",
                cursor: "pointer",
                borderRadius: "12px 12px 0 0",
                backgroundColor:
                  currentTab === index ? "var(--white)" : "transparent",
                border:
                  currentTab === index
                    ? "1px solid var(--border-color)"
                    : "1px solid transparent",
                borderBottom:
                  currentTab === index ? "2px solid transparent" : "none",
                marginBottom: currentTab === index ? "-2px" : "0",
                transition: "all 0.2s ease",
                minWidth: "160px",
                "&:hover": {
                  backgroundColor:
                    currentTab === index
                      ? "var(--white)"
                      : "rgba(255, 152, 0, 0.04)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" gap="10px">
                <Stack
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor:
                      currentTab === index
                        ? `${tab.color}15`
                        : "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: currentTab === index ? tab.color : "var(--text3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.icon}
                </Stack>
                <Stack>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: currentTab === index ? 700 : 600,
                      color:
                        currentTab === index ? "var(--text1)" : "var(--text2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "var(--text3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.description}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>

        {/* Tab Content */}
        <Box sx={{ padding: "32px" }}>
          {currentTab === 0 && <BannerManagement />}
          {currentTab === 1 && <FeaturedGoalsManagement />}
          {currentTab === 2 && <AnnouncementsManagement />}
        </Box>
      </Stack>
    </Stack>
  );
}
