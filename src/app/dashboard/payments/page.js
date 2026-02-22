"use client";
import dynamic from "next/dynamic";
import { Stack, Box, CircularProgress } from "@mui/material";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import PaymentsHeader from "./Components/PaymentsHeader";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

import RevenueTrendChart from "./Components/RevenueTrendChart";
import PaymentMethodChart from "./Components/PaymentMethodChart";

const Transactions = dynamic(() => import("./Transactions"), {
  loading: () => <TabLoading />,
});
const Coupons = dynamic(() => import("./Coupons"), {
  loading: () => <TabLoading />,
});
const Subscription = dynamic(() => import("./Subscription"), {
  loading: () => <TabLoading />,
});

const TabLoading = () => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "60vh", width: "100%" }}
  >
    <CircularProgress />
  </Stack>
);

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

export default function Payments() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activePlans: 0,
    totalCoupons: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subsData, couponsData, transData] = await Promise.all([
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/get-all`
          ),
          apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/get-all`),
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/transactions/get-all`
          ),
        ]);

        const activePlans = subsData?.status ? subsData.data.length : 0;
        const totalCoupons = couponsData?.success ? couponsData.data.length : 0;

        let totalRevenue = 0;
        let monthlyGrowth = 0;
        let allTransactions = [];

        if (transData?.success) {
          allTransactions = transData.data;
          setTransactions(allTransactions);

          // Calculate total revenue from completed transactions
          const completedTransactions = allTransactions.filter(
            (t) => t.status === "completed"
          );

          totalRevenue = completedTransactions.reduce(
            (sum, t) => sum + (t.amount || 0),
            0
          );

          // Calculate Monthly Growth
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear =
            currentMonth === 0 ? currentYear - 1 : currentYear;

          const currentMonthRevenue = completedTransactions
            .filter((t) => {
              const d = new Date(t.createdAt);
              return (
                d.getMonth() === currentMonth && d.getFullYear() === currentYear
              );
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          const lastMonthRevenue = completedTransactions
            .filter((t) => {
              const d = new Date(t.createdAt);
              return (
                d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
              );
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          if (lastMonthRevenue > 0) {
            monthlyGrowth =
              ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
              100;
          } else if (currentMonthRevenue > 0) {
            monthlyGrowth = 100; // 100% growth if previous month was 0
          }
        }

        setStats({
          totalRevenue,
          activePlans,
          totalCoupons,
          monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const tabs = useMemo(
    () => [
      {
        label: "Transactions",
        content: (
          <TabContentWrapper>
            <Transactions initialTransactions={transactions} />
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
    ],
    [transactions]
  );

  return (
    <Stack padding="20px" gap="24px">
      <PaymentsHeader stats={stats} loading={loading} />

      {/* Analytics Charts */}
      {!loading && transactions.length > 0 && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap="24px"
          height="400px"
        >
          <Box flex={2}>
            <RevenueTrendChart transactions={transactions} />
          </Box>
          <Box flex={1}>
            <PaymentMethodChart transactions={transactions} />
          </Box>
        </Stack>
      )}

      <CustomTabs tabs={tabs} />
    </Stack>
  );
}
