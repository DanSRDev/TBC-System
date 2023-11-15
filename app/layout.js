import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "./(components)/Nav";
import Footer from "./(components)/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TBC-System",
  description: "TBC Prediction System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col h-screen max-h-screen">
          <Nav />
          <div className="flex flex-col justify-center items-center flex-grow relative">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
