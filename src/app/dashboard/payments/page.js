"use client";
import { Stack, Box } from "@mui/material";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Transactions from "./Transactions";
import Coupons from "./Coupons";
import Subscription from "./Subscription";
import PaymentsHeader from "./Components/PaymentsHeader";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

// export const metadata = {
//   title: "Transaction",
// };
export default function Payments() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activePlans: 0,
    totalCoupons: 0,
    monthlyGrowth: 0,
  });

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch subscriptions
        const subsData = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/get-all`
        );

        // Fetch coupons
        const couponsData = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/get-all`
        );

        // Fetch transactions
        const transData = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/transactions/get-all`
        );

        const activePlans = subsData?.status ? subsData.data.length : 0;
        const totalCoupons = couponsData?.success ? couponsData.data.length : 0;

        // Calculate total revenue from completed transactions
        const totalRevenue = transData?.success
          ? transData.data
              .filter((t) => t.status === "completed")
              .reduce((sum, t) => sum + (t.amount || 0), 0)
          : 0;

        setStats({
          totalRevenue,
          activePlans,
          totalCoupons,
          monthlyGrowth: 12.5, // This should be calculated based on actual data
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const TabContentWrapper = ({ children }) => (
    <Box
      sx={{
        backgroundColor: "var(--white)",
        borderRadius: "12px",
        minHeight: "60vh",
        border: "1px solid var(--border-color)",
        marginTop: "20px",
      }}
    >
      {children}
    </Box>
  );

  const tabs = [
    {
      label: "Transactions",
      content: (
        <TabContentWrapper>
          <Transactions />
        </TabContentWrapper>
      ),
    },
    {
      label: "Subscription Plans",
      content: (
        <TabContentWrapper>
          <Subscription />
        </TabContentWrapper>
      ),
    },
    {
      label: "Coupons & Offers",
      content: (
        <TabContentWrapper>
          <Coupons />
        </TabContentWrapper>
      ),
    },
  ];

  return (
    <Stack padding="20px" gap="20px">
      <PaymentsHeader stats={stats} />
      <CustomTabs tabs={tabs} />
    </Stack>
  );
}
