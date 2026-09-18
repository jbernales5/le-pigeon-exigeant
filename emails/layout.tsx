import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

import { absoluteUrl, SITE } from "@/lib/site"

export const colors = {
  ink: "#141110",
  cream: "#F6F1E8",
  gold: "#D6B26B",
  terracotta: "#B9461A",
  muted: "#8A837B",
  border: "#E8E2D8",
}

export const fonts = {
  serif: "'Instrument Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
}

/** Shared chrome for every transactional email: dark header with the logo, cream body, discreet footer. */
export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>
          <Section style={{ backgroundColor: colors.ink, padding: "36px 40px 28px", textAlign: "center" as const }}>
            <Img src={absoluteUrl("/brand/logo-white.png")} alt={SITE.name} width="220" style={{ margin: "0 auto", display: "block" }} />
          </Section>
          <Section style={{ backgroundColor: "#FFFFFF", padding: "40px 40px 32px", borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
            {children}
          </Section>
          <Section style={{ backgroundColor: "#FFFFFF", padding: "0 40px 32px", border: `1px solid ${colors.border}`, borderTop: 0 }}>
            <Hr style={{ borderColor: colors.border, margin: "0 0 20px" }} />
            <Text style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: colors.muted, margin: 0, lineHeight: "18px" }}>
              {SITE.name} · {SITE.tagline}
              <br />
              Fait par des pigeons, pour des pigeons.
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, margin: "12px 0 0", lineHeight: "18px" }}>
              Vous recevez cet e-mail parce qu&apos;une demande a été faite avec votre adresse sur{" "}
              <Link href={SITE.url} style={{ color: colors.terracotta }}>
                {SITE.url.replace(/^https?:\/\//, "")}
              </Link>
              . Si ce n&apos;était pas vous, ignorez simplement ce message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const h1 = { fontFamily: fonts.serif, fontSize: 34, lineHeight: "38px", fontWeight: 400, margin: "0 0 20px", color: colors.ink }
export const eyebrow = { fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: colors.terracotta, fontWeight: 600, margin: "0 0 14px" }
export const p = { fontSize: 15, lineHeight: "25px", color: "#3A3531", margin: "0 0 16px" }
export const quote = { fontFamily: fonts.serif, fontSize: 21, lineHeight: "29px", color: colors.ink, margin: "8px 0 24px", paddingLeft: 18, borderLeft: `2px solid ${colors.terracotta}` }
