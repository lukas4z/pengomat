import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HostApp } from "@/components/HostApp";
import { isHostKey } from "@/lib/http";

export const metadata: Metadata = { title: "Pengomat – Gastgeber", robots: { index: false, follow: false } };

export default async function HostPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  if (!isHostKey(decoded)) notFound();
  return <HostApp hostKey={decoded} />;
}
