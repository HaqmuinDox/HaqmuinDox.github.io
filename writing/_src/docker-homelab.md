---
title: "My Docker homelab, container by container"
slug: docker-homelab
date: "2025-11"
tag: cheatsheet
readtime: "5 min"
excerpt: "A rundown of every container I run on my home server — what each one does, why I chose it, and the config decisions I'd make differently next time."
draft: false
---

I run a private cloud on a mini PC in my flat. It's on 24/7, costs almost nothing to run, and handles files, passwords, automation, and location tracking without any data leaving my network (unless I choose to). This is a snapshot of what's running and why.

## The stack at a glance

| Container | Purpose |
|---|---|
| Nextcloud | Files, contacts, calendars |
| Vaultwarden | Password manager |
| n8n | Workflow automation |
| Mosquitto | MQTT broker |
| Dawarich | Location history |

All containers sit behind a Tailscale VPN. The host runs Ubuntu 22.04 with Apache2 as the reverse proxy for internal HTTPS.

## Nextcloud

The centrepiece. I use it for file sync across my laptop and phone, CalDAV/CardDAV for contacts and calendars, and Nextcloud Notes as a simple scratchpad.

**What I'd do differently**: I installed it with the standard Docker image and a MariaDB container. Next time I'd use the all-in-one (AIO) image — it bundles a working TURN server, onlyoffice, and automatic backups, which I've since had to set up manually.

**Key config**: Set `overwriteprotocol: https` and `overwritehost` in `config.php` to avoid WebDAV sync clients getting confused by HTTP/HTTPS mismatches behind the proxy.

## Vaultwarden

An unofficial Bitwarden server implementation in Rust. Lighter than the official server (which requires .NET and a SQL Server), and compatible with all the Bitwarden clients.

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    restart: unless-stopped
    environment:
      - DOMAIN=https://vault.home.dancardoz.de
      - SIGNUPS_ALLOWED=false
    volumes:
      - vw_data:/data
```

`SIGNUPS_ALLOWED=false` is important once you've created your account. Otherwise anyone who can reach the server can create an account.

**What I'd do differently**: Nothing, actually. Vaultwarden has been rock-solid and the Bitwarden clients work identically. The only friction was the initial DNS-01 certificate for a private domain.

## n8n

A self-hosted workflow automation tool — think Zapier, but running locally. I use it for small automations: sending myself a notification when something changes on a website I'm watching, processing MQTT messages from a temperature sensor, moving files on a schedule.

n8n has a visual editor (a DAG of nodes) and can call any HTTP endpoint, which makes it useful for connecting services that don't have direct integrations.

```yaml
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_HOST=n8n.home.dancardoz.de
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.home.dancardoz.de/
    volumes:
      - n8n_data:/home/node/.n8n
```

**What I'd do differently**: n8n's workflow storage format changed between versions in a way that made manual backups hard to restore. I now run automated exports via n8n itself (yes, a workflow that backs up other workflows) on a nightly schedule.

## Mosquitto

A lightweight MQTT broker. I have a temperature/humidity sensor that publishes to it, and n8n subscribes to process the readings.

```bash
# mosquitto.conf
listener 1883 0.0.0.0
allow_anonymous false
password_file /mosquitto/config/passwd
```

MQTT traffic stays inside the Tailscale network. The broker is simple enough that there's not much to configure beyond basic authentication.

## Dawarich

Dawarich is a self-hosted alternative to Google Maps Timeline. It ingests location data from your phone (via Overland or the Dawarich app) and plots your movement history on a map — privately.

The stack is heavier than the others: it requires PostgreSQL with the PostGIS extension and Redis.

```yaml
  dawarich_app:
    image: freikin/dawarich:latest
    depends_on:
      - dawarich_db
      - dawarich_redis

  dawarich_db:
    image: postgis/postgis:16-3.4-alpine

  dawarich_redis:
    image: redis:7-alpine
```

**What I'd do differently**: Dawarich is still early-stage software and has had some database migration issues between releases. I'd set up automated Postgres backups before running it in production, which I didn't do initially and regretted during an upgrade.

## Networking and Tailscale

Every service is bound to the internal Docker network and exposed to Apache via `localhost:PORT`. Apache handles TLS termination and proxies to the right container based on the `ServerName`.

Tailscale handles access control. The mini PC is a Tailscale exit node for my phone when I'm on untrusted networks, and all the self-hosted services are reachable by name because of Tailscale's MagicDNS.

```bash
# Check which tailscale devices can reach the server
tailscale status
```

No ports are forwarded on my router. The attack surface for everything here is: Tailscale's auth layer.

## Backup strategy

A cron job runs nightly and:
1. Dumps each database to a compressed SQL file
2. Rsyncs the dumps + Docker volumes to an external USB drive
3. Uploads a copy to a remote location (Nextcloud on a friend's server)

The `3-2-1` rule: 3 copies, 2 media types, 1 offsite. I'm at `3-2-1` for the databases and `2-1-1` for the file volumes. Good enough for personal data.
