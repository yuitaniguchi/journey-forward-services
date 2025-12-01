import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';


interface LayoutAdminProps {
  previewText: string;
  children: React.ReactNode;
}

export const LayoutAdmin: React.FC<LayoutAdminProps> = ({ previewText, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded my-10 mx-auto p-5 max-w-xl">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};