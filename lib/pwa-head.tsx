import Head from "expo-router/head";

export function PwaHead() {
  return (
    <Head>
      <title>Groene Vingers</title>
      <meta name="theme-color" content="#37392B" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Groen" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="preload" href="/fonts/Satoshi-Light.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Satoshi-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Satoshi-Medium.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Satoshi-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Satoshi-Black.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      <style>{`
        @font-face {
          font-family: "Satoshi";
          src: url("/fonts/Satoshi-Regular.otf") format("opentype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Satoshi";
          src: url("/fonts/Satoshi-Light.otf") format("opentype");
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Satoshi";
          src: url("/fonts/Satoshi-Medium.otf") format("opentype");
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Satoshi";
          src: url("/fonts/Satoshi-Bold.otf") format("opentype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Satoshi";
          src: url("/fonts/Satoshi-Black.otf") format("opentype");
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </Head>
  );
}
