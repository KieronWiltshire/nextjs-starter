import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { Locale } from 'next-intl';
import { getTranslator } from '@/lib/i18n';

type EmailVerificationEmailProps = {
  locale: Locale;
  email: string;
  code: string;
  pendingAuthenticationToken: string;
};

export default async function EmailVerificationEmail({ locale = 'en', email = 'user@example.com', code = 'test', pendingAuthenticationToken = 'test' }: EmailVerificationEmailProps) {
  const t = await getTranslator(locale);
  const verificationUrl = new URL('/auth/verify-email', process.env.APP_URL);
  verificationUrl.searchParams.set('email', email);
  verificationUrl.searchParams.set('code', code);
  verificationUrl.searchParams.set('token', pendingAuthenticationToken);

  return (
    <Html>
      <Head />
      <Preview>{t('email.verification.preview')}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {t('email.verification.title')}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {t('email.verification.description')}
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] px-5 py-3 font-semibold no-underline text-center"
                href={verificationUrl.toString()}
              >
                {t('email.verification.buttonText')}
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              {t('email.verification.footer')}
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              {t('email.verification.disclaimer')}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}