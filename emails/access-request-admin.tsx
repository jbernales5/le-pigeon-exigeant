import { Link, Text } from "@react-email/components"

import { SITE } from "@/lib/site"

import { colors, EmailLayout, eyebrow, h1, p, quote } from "./layout"

type Props = { name: string; email: string; message: string | null; total: number }

export function AccessRequestAdminEmail({ name, email, message, total }: Props) {
  return (
    <EmailLayout preview={`Nouvelle demande d'accès : ${name} (${email})`}>
      <Text style={eyebrow}>Nouvelle demande d&apos;accès</Text>
      <Text style={h1}>{name} frappe à la porte de la volière.</Text>
      <Text style={p}>
        <strong>Nom</strong> : {name}
        <br />
        <strong>E-mail</strong> :{" "}
        <Link href={`mailto:${email}`} style={{ color: colors.terracotta }}>
          {email}
        </Link>
      </Text>
      {message ? <Text style={quote}>{message}</Text> : <Text style={{ ...p, color: colors.muted }}>Aucun message joint.</Text>}
      <Text style={p}>
        Pour inviter : <code style={{ fontSize: 13, backgroundColor: colors.cream, padding: "2px 6px" }}>npm run user:invite -- {email} &quot;{name}&quot;</code>
        , puis envoyez-lui le code d&apos;invitation ou le mot de passe généré.
      </Text>
      <Text style={{ ...p, fontSize: 13, color: colors.muted, margin: 0 }}>
        {total} demande{total > 1 ? "s" : ""} en attente au total · {SITE.name}
      </Text>
    </EmailLayout>
  )
}

export default AccessRequestAdminEmail
