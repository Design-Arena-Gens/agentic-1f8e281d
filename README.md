# TextToVideo Converter Pro

Converta textos de até 200.000 caracteres em áudio MP3 e vídeo MP4 compatível com qualquer PC. A aplicação foi projetada para fluxos de trabalho de equipes em Design Arena AI, combinando pipeline de voz sintetizada com renderização acelerada via FFmpeg.

## ⚡️ Principais Recursos

- Conversão ponta a ponta: texto → áudio MP3 → vídeo MP4 (H.264 + AAC)
- Compatível com roteiros longos (200k caracteres) com pipeline otimizado
- Interface responsiva (mobile first) com tema claro/escuro
- Upload de arquivos `.txt`, contador em tempo real e players integrados para pré-visualização
- Histórico de renderizações com downloads imediatos
- Backend em Next.js API Routes com FFmpeg (`ffmpeg-static`) e armazenamento local
- Persistência via PostgreSQL (Prisma ORM)

## 🧱 Stack Técnica

- **Front-end**: Next.js 14 (App Router), React 18, Tailwind CSS, next-themes
- **Back-end**: Next.js API Routes, `node-gtts` para síntese de voz, `fluent-ffmpeg` + `ffmpeg-static` para renderização
- **Banco**: PostgreSQL acessado com Prisma
- **Utilidades**: `@napi-rs/canvas` para frames, Zod para validação, UUID para versionamento de arquivos

## 🚀 Como Executar Localmente

1. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # atualize DATABASE_URL com sua instância PostgreSQL
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Gere o cliente Prisma e rode as migrações:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000` e realize a primeira conversão.

## 🗃️ Estrutura Resumida

```
app/
  api/
    convert/route.ts         # Pipeline principal de conversão
    conversions/             # Endpoints de histórico e download
  layout.tsx                 # Layout base e provider de tema
  page.tsx                   # Dashboard completo
components/                  # Formulário, histórico, toggle de tema
lib/                         # Prisma, FFmpeg, utilitários de arquivos
prisma/schema.prisma         # Modelos e enums do banco
storage/                     # Gerado em runtime (áudio/vídeo/imagens)
```

## 🧪 Testes e Verificação

- `npm run dev`: valida toda a experiência interativa
- `curl http://localhost:3000/api/convert` com JSON para testar a API (vide `/components/conversion-form.tsx` para payload)
- Garanta que FFmpeg está funcional no ambiente (o pacote `ffmpeg-static` fornece binário portátil)

## 📦 Deploy (Vercel)

O projeto está pronto para deploy em produção na Vercel. Após configurar `DATABASE_URL` e `VERCEL_TOKEN`, execute:

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-1f8e281d
```

Depois valide a URL pública:

```bash
curl https://agentic-1f8e281d.vercel.app
```

## 📑 Licença

Distribuído sob licença MIT. Ajuste conforme necessário.
