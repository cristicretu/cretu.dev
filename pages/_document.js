import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <link
                        rel="preload"
                        href="/fonts/inter-var-latin.woff2"
                        as="font"
                        type="font/woff2"
                        crossOrigin="anonymous"
                    />
                    <link
                        href="/static/favicons/site.webmanifest"
                        rel="manifest"
                    />
                    <link
                        href="/static/favicons/favicon.ico"
                        rel="shortcut icon"
                    />
                    <meta content="#ffffff" name="theme-color" />
                    <meta content="#ffffff" name="msapplication-TileColor" />
                    <meta
                        content="/static/favicons/browserconfig.xml"
                        name="msapplication-config"
                    />
                    <meta
                        content="fK4YqLAHjoaynXLF1e5gaPzDNOircgiYSgAwSXqr61o"
                        name="google-site-verification"
                    />
                </Head>
                <body className="bg-white dark:bg-black text-white dark:text-black">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
