# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/70b58f8a-221e-4ea1-af24-8e7227c89d5d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/70b58f8a-221e-4ea1-af24-8e7227c89d5d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/70b58f8a-221e-4ea1-af24-8e7227c89d5d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Checkout configuration & required secrets

The checkout experience depends on a few edge functions (shipping quotes, payment creation and webhooks). Configure the following environment secrets before deploying:

| Secret | Where it is used | Description |
| --- | --- | --- |
| `MELHOR_ENVIO_TOKEN` | `calculate-shipping` edge function | Personal access token for the Melhor Envio API so we can fetch real shipping options. |
| `MELHOR_ENVIO_ORIGIN_POSTAL_CODE` | `calculate-shipping` edge function | (Optional) Override the origin CEP used in shipping quotes to match your registered Melhor Envio sender address. |
| `MELHOR_ENVIO_SERVICE_IDS` | `calculate-shipping` edge function | (Optional) Comma-separated Melhor Envio service IDs to quote (e.g. `1,2` for Correios). If omitted, the function will auto-fetch available services for the token. |
| `MERCADO_PAGO_ACCESS_TOKEN` | `create-mercado-pago-payment` + webhook | Access token for Mercado Pago to create checkout preferences and pull payment status. |
| `MERCADO_PAGO_WEBHOOK_SECRET` | `create-mercado-pago-payment` + webhook | Shared secret appended to the webhook URL; requests must include `?secret=...` or they will be rejected. |
| `PUBLIC_SITE_URL` | `create-mercado-pago-payment` | The public storefront URL used to build the `back_urls` (e.g. `https://meiolimao.com.br`). |
| `SUPABASE_SERVICE_ROLE_KEY` | All edge functions | Needed so the functions can create orders, payments and audit logs bypassing RLS. |

Set them with the Supabase CLI:

```sh
supabase secrets set \
  MELHOR_ENVIO_TOKEN="..." \
  MELHOR_ENVIO_SERVICE_IDS="1,2" \
  MERCADO_PAGO_ACCESS_TOKEN="..." \
  MERCADO_PAGO_WEBHOOK_SECRET="super-secret" \
  PUBLIC_SITE_URL="https://meiolimao.com.br"
```

The `create-mercado-pago-payment` function automatically appends `?secret=<MERCADO_PAGO_WEBHOOK_SECRET>` to the webhook URL, so use the same secret when registering the webhook inside the Mercado Pago dashboard.
