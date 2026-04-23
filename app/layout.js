export const metadata = {
  title: 'Guia do Paciente | Nutri Vitor Sandrin',
  description: 'Escala de Bristol e Avaliação Semanal',
}
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
