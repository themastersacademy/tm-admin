"use client";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, East, PlaylistAddCheck } from "@mui/icons-material";
import {
  Button,
  Chip,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { enqueueSnackbar } from "notistack";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";

export default function StudentSubscription() {
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dialogOpen = () => setIsDialogOpen(true);
  const dialogClose = () => setIsDialogOpen(false);
  const [subscriptionCard, setSubscriptionCard] = useState([]);

  const fetchSubscriptionCard = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/get-subscription`
      ).then((data) => {
        if (data.success) {
          setSubscriptionCard(data.data);
        }
        setIsLoading(false);
      });
    } catch (error) {}
  }, [id]);
  useEffect(() => {
    fetchSubscriptionCard();
  }, [fetchSubscriptionCard]);

  return (
    <Stack
      sx={{
        gap: "15px",
        marginTop: "20px",
        minHeight: "70vh",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Subscription
        </Typography>
        <Stack flexDirection="row" gap="20px">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Add
          </Button>
        </Stack>
      </Stack>
      <Stack flexWrap="wrap" flexDirection="row" rowGap="20px" columnGap="50px">
        {!isLoading ? (
          subscriptionCard.length > 0 ? (
            subscriptionCard.map((item, index) => (
              <SubscriptionCard key={index} subscription={item} id={id} />
            ))
          ) : (
            <Stack
              width="100%"
              minHeight="500px"
              justifyContent="center"
              alignItems="center"
            >
              <NoDataFound info="No subscription available" />
            </Stack>
          )
        ) : (
          <SecondaryCardSkeleton />
        )}
      </Stack>
      <AddSubscription
        isDialogOpen={isDialogOpen}
        dialogClose={dialogClose}
        userID={id}
      />
    </Stack>
  );
}

const AddSubscription = ({ isDialogOpen, dialogClose, userID }) => {
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [subscription, setSubscription] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubscriptionChange = (item) => {
    setSelectedSubscription(item);
  };

  const fetchSubscription = () => {
    try {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/get-all`
      ).then((data) => {
        if (data.status) {
          setSubscription(data.data);
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAddSubscription = () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userID}/add-subscription`,
      {
        method: "POST",
        body: JSON.stringify({
          subscriptionPlanID: selectedSubscription.id,
        }),
      }
    ).then((data) => {
      console.log("data", data);
      if (data.success) {
        dialogClose();
        enqueueSnackbar(data.message, {
          variant: "success",
        });
        fetchSubscription();
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
        });
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <DialogBox
      isOpen={isDialogOpen}
      onClose={dialogClose}
      title="Add Subscription"
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          sx={{
            color: "var(--primary-color)",
            textTransform: "none",
          }}
          disabled={!selectedSubscription}
          disableElevation
          loading={isLoading}
          onClick={handleAddSubscription}
        >
          Add Subscription
        </Button>
      }
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{ borderRadius: "8px", padding: "4px" }}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
    >
      <DialogContent>
        <Stack gap="10px">
          {subscription.length > 0 &&
            subscription.map((item, index) => (
              <SecondaryCard
                key={index}
                title={`₹ ${item.priceWithTax}`}
                subTitle={
                  <Stack flexDirection="row" gap="15px">
                    <Typography sx={{ fontSize: "14px" }}>{`${item.duration} ${
                      item.type === "MONTHLY" ? "Months" : "Years"
                    }`}</Typography>
                    <Typography
                      sx={{ fontSize: "14px" }}
                    >{`${item.discountInPercent}% off`}</Typography>
                  </Stack>
                }
                icon={
                  <PlaylistAddCheck
                    sx={{ color: "var(--sec-color)", fontSize: "34px" }}
                  />
                }
                onClick={() => handleSubscriptionChange(item)}
                sx={{
                  cursor: "pointer",
                  borderColor:
                    selectedSubscription?.id === item.id
                      ? "var(--sec-color)"
                      : "transparent",
                  backgroundColor: "var(--white)",
                  "&:hover": {
                    border: "1.5px solid var(--sec-color)",
                  },
                }}
              />
            ))}
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};

const SubscriptionCard = ({ subscription, id }) => {
  const [isActive, setIsActive] = useState(subscription.status === "active");
  const handleSubscriptionStatusChange = (subscriptionID, isActive) => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/update-subscription-status`,
      {
        method: "POST",
        body: JSON.stringify({
          subscriptionID,
          isActive,
        }),
      }
    );
  };
  return (
    <SecondaryCard
      title={`₹ ${subscription.plan.priceWithTax}`}
      subTitle={
        <Stack flexDirection="row" gap="15px">
          <Typography sx={{ fontSize: "14px" }}>{`${
            subscription.plan.duration
          } ${
            subscription.plan.type === "MONTHLY" ? "Months" : "Years"
          }`}</Typography>
          <Typography
            sx={{ fontSize: "14px" }}
          >{`${subscription.plan.discountInPercent}% off`}</Typography>
          <Typography sx={{ fontSize: "14px" }}>{`Till - ${new Date(
            subscription.expiresAt
          ).toLocaleDateString()}`}</Typography>
        </Stack>
      }
      icon={
        <PlaylistAddCheck
          sx={{ color: "var(--sec-color)", fontSize: "34px" }}
        />
      }
      button={
        <Stack flexDirection="row" gap="10px">
          <Chip
            label={subscription.status || ""}
            sx={{
              backgroundColor: "var(--sec-color-acc-2)",
              color: "var(--sec-color)",
              textTransform: "capitalize",
              borderRadius: "8px",
            }}
          />
          <StyledSwitch
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              handleSubscriptionStatusChange(subscription.id, e.target.checked);
            }}
          />
        </Stack>
      }
      cardWidth="500px"
    />
  );
};
