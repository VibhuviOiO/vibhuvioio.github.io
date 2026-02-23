import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  metadataBase: new URL("https://vibhuvioio.com/"),
  title: "VibhuviOiO - Open Source Infrastructure Tools & DevOps Automation",
  description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring. We make your infrastructure boring, operations invisible, and monitoring effortless.",
  keywords: [
    "private cloud",
    "self-hosted infrastructure",
    "bare metal cloud",
    "devops automation",
    "kubernetes",
    "observability",
    "on-prem",
    "platform engineering",
    "open source"
  ],
  openGraph: {
    title: "VibhuviOiO - Open Source Infrastructure Tools",
    description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring. Self-hosted DevOps automation.",
    url: "https://vibhuvioio.com",
    type: "website",
    siteName: "VibhuviOiO",
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 630,
        alt: "VibhuviOiO - Open Source Infrastructure Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibhuviOiO - Open Source Infrastructure Tools",
    description: "Production-ready open source infrastructure tools for Docker, Kubernetes, LDAP, and monitoring.",
    images: ["/img/og-image.png"],
  },
  alternates: {
    canonical: "https://vibhuvioio.com",
  },
};

export default function Home() {
  return <div className="show-footer"><HomeContent /></div>;
}
