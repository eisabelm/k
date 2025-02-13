# Cloudflare Setup Instructions for ccrccgame.org

## DNS Configuration

1. Log in to your Cloudflare account
2. Select your domain (ccrccgame.org)
3. Go to the DNS settings
4. Add an A record:
   - Type: A
   - Name: @ (for root domain)
   - Content: Your Raspberry Pi's public IP address
   - Proxy status: Proxied (orange cloud)
5. Add a CNAME record for www:
   - Type: CNAME
   - Name: www
   - Content: ccrccgame.org
   - Proxy status: Proxied (orange cloud)

## SSL/TLS Settings

1. Go to the SSL/TLS section
2. Set SSL/TLS encryption mode to "Full"
3. Enable "Always Use HTTPS" under the Edge Certificates tab

## Page Rules (Optional)

Consider adding these page rules:
1. Always Use HTTPS
   - URL: http://*ccrccgame.org/*
   - Setting: Always Use HTTPS

## Security Settings

1. Under Security Settings:
   - Set Security Level to "Medium"
   - Enable "Browser Integrity Check"
   - Enable "Always Online"

## Cache Settings

1. Under Caching:
   - Set Browser Cache TTL to "4 hours"
   - Enable "Always Online"
   - Enable "Development Mode" temporarily when deploying updates

## Testing

After configuration:
1. Wait for DNS propagation (may take up to 24 hours)
2. Test both https://ccrccgame.org and https://www.ccrccgame.org
3. Verify that API calls work properly through the proxy
4. Check SSL certificate is valid and secure

## Troubleshooting

If you encounter issues:
1. Verify Raspberry Pi's firewall allows incoming traffic on ports 80 and 443
2. Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`
3. Check backend logs: `sudo journalctl -u videostream -f`
