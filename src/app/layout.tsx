"use client";
import { JazzInspector } from "jazz-tools/inspector";
import { JazzReactProvider } from "jazz-tools/react";
import { JazzAccount } from "../schema";
const apiKey = process.env.NEXT_PUBLIC_JAZZ_API_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        />
      </head>

      <body className="container">
        <JazzReactProvider
          AccountSchema={JazzAccount}
          sync={{
            peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
          }}
        >
          {children}
          <JazzInspector />
        </JazzReactProvider>
      </body>
    </html>
  );
}
