# @clipform/n8n-nodes-clipform

An [n8n](https://n8n.io) community node for [Clipform](https://clipform.io) - start a workflow whenever a form is completed.

This is a trigger node. It works the same on **n8n Cloud and self-hosted**: it authenticates with a Clipform API key (no OAuth redirect URI to register), so it runs anywhere.

## Installation

Follow the [community nodes install guide](https://docs.n8n.io/integrations/community-nodes/installation/). In n8n: **Settings -> Community nodes -> Install**, then enter `@clipform/n8n-nodes-clipform`.

## Credentials

1. In Clipform, open **Developer -> API keys** and click **Create API key**. Copy it (it starts with `cf_` and is shown once).
2. In n8n, create a new **Clipform API** credential and paste the key. n8n verifies it against `GET /v1/connect/me`.

## Trigger: On form response

Add the **Clipform Trigger** node. When you activate the workflow it subscribes to your workspace's form completions; when you deactivate it, it unsubscribes.

It fires for **every completed form in the workspace**. Each event is the standard `form.completed` payload, which includes `form_id`, `form_name`, `form_tags`, `share_id`, `submitted_at`, and the `responses`. To react to one form only, add an **IF** / **Filter** node on `form_id` or `form_tags`.

See the [Clipform webhook payload reference](https://clipform.io/docs/api-reference/webhooks/payload) for the full shape.

## Compatibility

Requires n8n with `n8n-workflow` v1. Built against the verified-community-node guidelines (no runtime dependencies).

## License

MIT
