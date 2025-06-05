"use client";
import { useState, useEffect, useCallback } from "react";
import LongDialogBox from "@/src/components/LongDialogBox/LongDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import { apiFetch } from "@/src/lib/apiFetch";
import { PlayCircleRounded } from "@mui/icons-material";
import { DialogContent, IconButton, Stack } from "@mui/material";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function LinkDialog({
  isOpen,
  onClose,
  handleLessonUpdate,
  course,
  lesson,
}) {
  const { showSnackbar } = useSnackbar();
  const [allBanks, setAllBanks] = useState([]);
  const [resourceList, setResourceList] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  const handleBankChange = useCallback((e) => {
    setSelectedBank(e.target.value);
  }, []);

  const fetchBanks = useCallback(async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-all-bank`
      );
      setAllBanks(data.success ? data.data.banks : []);
    } catch (error) {
      console.error("Error fetching banks:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const fetchBank = useCallback(
    async (bankID) => {
      try {
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-bank/${bankID}`
        );
        if (data.success) {
          setResourceList(data.data.resources);
        } else {
          showSnackbar("No Bank Found", "error", "", "3000");
          setResourceList([]);
        }
      } catch (error) {
        console.error("Error fetching bank data:", error.message);
      }
    },
    [showSnackbar]
  );

  useEffect(() => {
    if (selectedBank) {
      fetchBank(selectedBank);
    } else {
      setResourceList([]);
    }
  }, [selectedBank, fetchBank]);

  const handleAddResource = useCallback(
    (resource) => {
      handleLessonUpdate(null, lesson.id, course.id, {
        resourceID: resource.resourceID,
      });
      onClose();
    },
    [handleLessonUpdate, lesson.id, course.id, onClose]
  );

  return (
    <LongDialogBox isOpen={isOpen} onClose={onClose} title="Link resources">
      <DialogContent>
        <Stack direction="row" gap="10px" mb="20px">
          <Stack width="30%">
            <StyledSelect
              title="Select Course"
              value={selectedBank}
              options={allBanks}
              getLabel={(bank) => bank.title}
              getValue={(bank) => bank.bankID}
              onChange={handleBankChange}
            />
          </Stack>
          <SearchBox />
        </Stack>
        <Stack gap="20px">
          <Stack direction="row" columnGap="40px" rowGap="15px" flexWrap="wrap">
            {resourceList.length > 0 ? (
              resourceList.map((item, index) => (
                <SecondaryCard
                  key={index}
                  cardWidth="300px"
                  title={item.name}
                  icon={
                    <PlayCircleRounded sx={{ color: "var(--sec-color)" }} />
                  }
                  button={
                    <IconButton
                      onClick={() => handleAddResource(item)}
                      sx={{
                        backgroundColor: "var(--sec-color-acc-1)",
                        color: "var(--sec-color)",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    >
                      Add
                    </IconButton>
                  }
                />
              ))
            ) : (
              <NoDataFound info="No Resources Found" />
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </LongDialogBox>
  );
}
