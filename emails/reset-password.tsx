import { Button, Section, Text } from "@react-email/components"

import { SITE } from "@/lib/site"

import { colors, EmailLayout, eyebrow, h1, p, quote } from "./layout"

export function ResetPasswordEmail({ name, url, expiresInMinutes = 60 }: { name: string; url: string; expiresInMinutes?: number }) {
  const firstName = name.trim().split(/\s+/)[0] || "cher pigeon"
  return (
    <EmailLayout preview={`${firstName}, voici le lien pour choisir un nouveau mot de passe. Il expire dans ${expiresInMinutes} minutes.`}>
      <Text style={eyebrow}>Mot de passe oublié</Text>
      <Text style={h1}>Ça arrive aux meilleurs pigeons, {firstName}.</Text>
      <Text style={p}>
        Vous avez demandé à changer le mot de passe de votre compte {SITE.name}. Un clic sur le bouton ci-dessous, un nouveau mot de passe, et
        la volière vous rouvre ses portes.
      </Text>
      <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
        <Button
          href={url}
          style={{ backgroundColor: colors.ink, color: colors.cream, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" as const, fontWeight: 600, padding: "14px 28px", textDecoration: "none" }}
        >
          Choisir un nouveau mot de passe
        </Button>
      </Section>
      <Text style={quote}>Ce lien est valable {expiresInMinutes} minutes, et une seule fois. Comme une bonne table, il ne se garde pas.</Text>
      <Text style={p}>
        Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement ce message : votre mot de passe actuel reste inchangé et
        personne n&apos;a accédé à votre compte.
      </Text>
      <Text style={{ ...p, fontSize: 12, color: colors.muted, margin: 0, wordBreak: "break-all" as const }}>
        Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
        <br />
        {url}
      </Text>
    </EmailLayout>
  )
}

export default ResetPasswordEmail
