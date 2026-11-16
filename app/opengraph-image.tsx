import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt =
  "Reverend Insanity (RI) by Gu Zhenren — Read all 2,334 chapters online free";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const fontRegular = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/roboto-3/roboto-regular.ttf")
  );
  const fontBold = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/roboto-3/roboto-bold.ttf")
  );
  const coverBuffer = fs.readFileSync(
    path.join(process.cwd(), "public/images/book-cover.jpg")
  );
  const coverBase64 = `data:image/jpeg;base64,${coverBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#faf8f3",
          color: "#181714",
          padding: "56px 64px",
          fontFamily: "Roboto",
          border: "1px solid #e0dacf",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "700px",
            height: "100%",
            paddingRight: "36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <svg
              width="44"
              height="44"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="56" height="56" rx="8" fill="#af1d27" />
              <rect
                x="8.5"
                y="8.5"
                width="47"
                height="47"
                rx="5"
                fill="none"
                stroke="#faf8f3"
                strokeOpacity="0.32"
                strokeWidth="1.2"
              />
              <g
                fill="none"
                stroke="#faf8f3"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="26" y="13.5" width="12" height="7" rx="1.2" />
                <path d="M32 10.5v15.5M26.5 26.5l11-2M36.5 23.5l2 3.5" />
                <rect x="13.5" y="29" width="11.5" height="6.5" rx="1.2" />
                <path d="M19.25 26v13.5M14.5 39.8l9.8-1.6M23.5 37l1.8 3" />
                <rect x="39" y="29" width="11.5" height="6.5" rx="1.2" />
                <path d="M44.75 26v13.5M40 39.8l9.8-1.6M49 37l1.8 3" />
                <rect x="17" y="44.5" width="30" height="7.5" rx="1.2" />
                <path d="M27 44.5V52M37 44.5V52M13.5 52h37" />
              </g>
            </svg>
            <span
              style={{
                fontSize: "18px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#af1d27",
                fontWeight: 700,
              }}
            >
              GU ZHENREN · COMPLETE EDITION
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                fontSize: "68px",
                lineHeight: 1.06,
                color: "#181714",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Reverend Insanity
            </div>
            <div
              style={{
                fontSize: "25px",
                lineHeight: 1.45,
                color: "#625e56",
              }}
            >
              Read all 2,334 chapters online free. Ad-free English translation,
              original Chinese raw, and offline EPUB downloads.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              borderTop: "1px solid #e0dacf",
              paddingTop: "20px",
              fontSize: "20px",
              color: "#625e56",
            }}
          >
            <span style={{ color: "#181714", fontWeight: 700 }}>
              Reverend Reader
            </span>
            <span>·</span>
            <span>2,334 Chapters</span>
            <span>·</span>
            <span>4.86M Words</span>
            <span>·</span>
            <span>Free &amp; Ad-Free</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "330px",
            height: "482px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #c6beb0",
            boxShadow: "0 18px 36px rgba(24, 23, 20, 0.14)",
          }}
        >
          <img
            src={coverBase64}
            alt="Reverend Insanity cover"
            width={330}
            height={482}
            style={{ objectFit: "cover", width: "330px", height: "482px" }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Roboto",
          data: fontRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Roboto",
          data: fontBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
