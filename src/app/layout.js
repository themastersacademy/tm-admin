import { Geist, Geist_Mono, Lato } from "next/font/google";
import "./globals.css";
import { SnackbarProvider } from "./context/SnackbarContext";
import { SubjectProvider } from "./context/SubjectContext";
import { CourseProvider } from "./context/CourseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const name = process.env.NEXT_PUBLIC_COMPANY_NAME;

export const metadata = {
  title: {
    default: name,
    template: "%s |" + name,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lato.variable}`}
      >
        <SubjectProvider>
          <CourseProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </CourseProvider>
        </SubjectProvider>
      </body>
    </html>
  );
}
