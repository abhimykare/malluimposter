"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/useTranslation";

import { ArrowLeftIcon } from "./icons";
import { IconButton } from "./IconButton";

/** Back control for otherwise-static screens. */
export function BackButton({ href = "/" }: { href?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <IconButton label={t("back")} onClick={() => router.push(href)}>
      <ArrowLeftIcon />
    </IconButton>
  );
}
