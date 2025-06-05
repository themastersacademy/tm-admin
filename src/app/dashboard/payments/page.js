"use client";
import { Stack } from "@mui/material";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Transactions from "./Transactions";
import Coupons from "./Coupons";
import Header from "@/src/components/Header/Header";
import Subscription from "./Subscription";

// export const metadata = {
//   title: "Transaction",
// };
export default function Payments() {
  const menuOptions = ["Remove"];
  const tabs = [
    { label: "Transactions", content: <Transactions /> },
    { label: "Subscription", content: <Subscription /> },
    { label: "Coupons", content: <Coupons /> },
  ];
  return (
    <Stack padding="20px" gap="20px">
      <Header title="Payments & Coupons" />
      <CustomTabs tabs={tabs} />
    </Stack>
  );
}
