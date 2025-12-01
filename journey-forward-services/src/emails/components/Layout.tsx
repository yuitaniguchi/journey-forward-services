import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Img,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

const COMPANY_NAME = "Journey Forward Services";
const LOGO_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764549569/logo_t0unzo.png";
const CONTACT_EMAIL = "contact@jfs.org";

export const Layout: React.FC<
  React.PropsWithChildren<{ previewText: string }>
> = ({ children, previewText }) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <div className="p-4">
              <Img src={LOGO_URL} width="300" alt={COMPANY_NAME} />
            </div>

            <div className="px-6 py-4">{children}</div>

            <div className="px-6 pb-6">
              <Text className="text-base font-semibold">
                Questions or updates?
              </Text>
              <Text className="text-sm">
                Feel free to reply to this email or contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-black no-underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </Text>

              <Text className="text-sm text-black mt-4">
                With appreciation, <br />
                The {COMPANY_NAME} Team
              </Text>

              <Text className="font-bold text-base text-black mt-6">
                {COMPANY_NAME}
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0 0",
  maxWidth: "600px",
};

export default Layout;
