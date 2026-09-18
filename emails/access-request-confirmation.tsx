import { Button, Section, Text } from "@react-email/components"

import { SITE } from "@/lib/site"

import { colors, EmailLayout, eyebrow, h1, p, quote } from "./layout"

export function AccessRequestConfirmationEmail({ name }: { name: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "cher pigeon"
  return (
    <EmailLayout preview={`${firstName}, votre demande d'accès a bien été reçue. Un pigeon la lit en ce moment même.`}>
      <Text style={eyebrow}>Demande reçue</Text>
      <Text style={h1}>Bienvenue sur le rebord de la fenêtre, {firstName}.</Text>
      <Text style={p}>
        Votre demande d&apos;accès à {SITE.name} est arrivée à bon port. Elle est lue par un humain, à la main, comme tout le reste ici.
        Cela prend en général quelques jours : le temps de finir un café, parfois deux.
      </Text>
      <Text style={quote}>La volière reste petite pour rester sincère. Merci de vouloir en faire partie.</Text>
      <Text style={p}>
        Si un membre vous a parlé de nous, répondez à ce message en nous disant qui : les pigeons parrainés passent devant. Sinon,
        dites-nous simplement l&apos;adresse qui vous a le plus marqué ces dernières années. C&apos;est notre seule vraie question d&apos;entrée.
      </Text>
      <Section style={{ textAlign: "center" as const, margin: "28px 0 8px" }}>
        <Button
          href={SITE.url}
          style={{ backgroundColor: colors.ink, color: colors.cream, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" as const, fontWeight: 600, padding: "14px 28px", textDecoration: "none" }}
        >
          Découvrir {SITE.name}
        </Button>
      </Section>
      <Text style={{ ...p, fontSize: 13, color: colors.muted, textAlign: "center" as const, margin: "16px 0 0" }}>
        À très vite, <br />
        les pigeons de {SITE.name}
      </Text>
    </EmailLayout>
  )
}

export default AccessRequestConfirmationEmail
