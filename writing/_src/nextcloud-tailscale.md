---
title: "Self-hosting Nextcloud behind Tailscale"
slug: nextcloud-tailscale
date: "2026-03"
tag: notes
readtime: "6 min"
excerpt: "How I set up Nextcloud on Ubuntu behind a Tailscale VPN — covering Docker networking, SSL termination via Apache, and the config quirks that took me a few evenings to figure out."
draft: false
---

Running your own cloud sounds like a weekend project. In my case it turned into a proper infrastructure — Nextcloud, Vaultwarden, n8n, Dawarich, and a few more containers, all restricted to a Tailscale mesh so they're never exposed to the open internet. This post covers the Nextcloud piece specifically: getting it running reliably behind Tailscale with SSL from Let's Encrypt.

## Why Tailscale instead of a public reverse proxy

The tempting path is to put Nginx or Caddy on a VPS, forward traffic, and get automatic HTTPS. I tried that. The problem: your files and your password manager are accessible to anyone who can reach that IP. Even with strong passwords, you're one misconfigured firewall rule away from trouble.

Tailscale solves this by making your services reachable only to devices enrolled in your tailnet. No public IP, no open ports. The tradeoff: you can't share links with people outside your tailnet, which is fine for a personal setup.

## Prerequisites

- Ubuntu server (I run 22.04 on a repurposed mini PC)
- Docker and Docker Compose installed
- Tailscale installed and authenticated on the server
- A domain name (I use `nextcloud.home.dancardoz.de`) with DNS pointing to your Tailscale IP

### Get your Tailscale IP

```bash
tailscale ip -4
# → 100.x.x.x
```

Add an A record in your DNS provider pointing `nextcloud.home.dancardoz.de` to that IP. Because this is a private IP, only devices in your tailnet will be able to resolve it to something reachable.

## Docker Compose setup

```yaml
version: "3.9"
services:
  nextcloud:
    image: nextcloud:28
    restart: unless-stopped
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=${NC_DB_PASSWORD}
      - NEXTCLOUD_TRUSTED_DOMAINS=nextcloud.home.dancardoz.de
    volumes:
      - nextcloud_data:/var/www/html
    depends_on:
      - db

  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=${NC_DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

volumes:
  nextcloud_data:
  db_data:
```

Note: `NEXTCLOUD_TRUSTED_DOMAINS` must exactly match the hostname you'll use. Nextcloud blocks requests from unrecognised hosts — this caught me off guard the first time.

## SSL with Apache and Let's Encrypt

Nextcloud recommends Apache as the reverse proxy. Install it and enable the required modules:

```bash
sudo apt install apache2
sudo a2enmod proxy proxy_http ssl rewrite headers
```

Then add a virtual host:

```apache
<VirtualHost *:443>
  ServerName nextcloud.home.dancardoz.de

  SSLEngine on
  SSLCertificateFile    /etc/letsencrypt/live/nextcloud.home.dancardoz.de/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/nextcloud.home.dancardoz.de/privkey.pem

  ProxyPass        / http://localhost:8080/
  ProxyPassReverse / http://localhost:8080/

  RequestHeader set X-Forwarded-Proto "https"
  RequestHeader set X-Forwarded-Port  "443"
</VirtualHost>
```

### Certbot with Tailscale

Here's the non-obvious part: Certbot's HTTP-01 challenge requires a publicly reachable server, but yours isn't public. Use the DNS-01 challenge instead — it proves domain ownership through a TXT record, not an HTTP endpoint.

```bash
sudo apt install certbot python3-certbot-dns-<your-provider>
sudo certbot certonly \
  --dns-<your-provider> \
  -d nextcloud.home.dancardoz.de
```

Replace `<your-provider>` with your DNS provider's plugin (e.g. `cloudflare`, `namecheap`). You'll need an API token with permission to add TXT records.

## Nextcloud config tweaks

After the first login, Nextcloud will likely warn about a few missing config values. Edit `/path/to/nextcloud/config/config.php`:

```php
'overwriteprotocol' => 'https',
'overwritehost'     => 'nextcloud.home.dancardoz.de',
'trusted_proxies'   => ['127.0.0.1'],
```

Without `overwriteprotocol`, Nextcloud generates `http://` URLs for WebDAV and caldav even when your clients are connecting over HTTPS — sync clients will fail silently.

## Background jobs

Nextcloud's background jobs (thumbnail generation, activity cleanup, etc.) default to AJAX mode, which only runs when someone has the web UI open. Set them to cron:

```bash
# On the host, not inside the container
* * * * * docker exec nextcloud_nextcloud_1 \
  php -f /var/www/html/cron.php
```

The container name depends on your Compose project name. Check with `docker ps`.

## Result

After all this: Nextcloud is accessible from any device in my tailnet, syncing contacts, calendars, and files. The private IP means it never appears in any internet scan. Certbot renews the certificate automatically via a systemd timer.

Total monthly cost: electricity for the mini PC and the domain name.
