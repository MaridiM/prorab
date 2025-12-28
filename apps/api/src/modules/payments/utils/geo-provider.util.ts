import * as geoip from 'geoip-lite';
import { PaymentProviderType } from '@prisma/generated/client';

/**
 * Countries that should use YooKassa (Russia, Belarus, Kazakhstan, etc.)
 */
const YOOKASSA_COUNTRIES = [
  'RU', // Russia
  'BY', // Belarus
  'KZ', // Kazakhstan
  'AM', // Armenia
  'AZ', // Azerbaijan
  'KG', // Kyrgyzstan
  'MD', // Moldova
  'TJ', // Tajikistan
  'TM', // Turkmenistan
  'UZ', // Uzbekistan
];

/**
 * Determine payment provider based on user's IP address
 *
 * @param ip - User's IP address (can be IPv4 or IPv6)
 * @returns PaymentProviderType - YOOKASSA for CIS countries, STRIPE for others
 *
 * Rules:
 * - Russia, Belarus, Kazakhstan, other CIS → YooKassa
 * - Ukraine, Europe, USA, other countries → Stripe
 * - Unknown/localhost → Stripe (default)
 */
export function getProviderByIP(ip: string): PaymentProviderType {
  // Handle localhost/private IPs - default to Stripe
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return PaymentProviderType.STRIPE;
  }

  // Lookup IP geolocation
  const geo = geoip.lookup(ip);

  // If no geo data or country not found - default to Stripe
  if (!geo || !geo.country) {
    return PaymentProviderType.STRIPE;
  }

  // Check if country should use YooKassa
  if (YOOKASSA_COUNTRIES.includes(geo.country)) {
    return PaymentProviderType.YOOKASSA;
  }

  // All other countries use Stripe
  return PaymentProviderType.STRIPE;
}

/**
 * Get user's real IP from Express request
 * Handles proxies and load balancers (x-forwarded-for, x-real-ip)
 *
 * @param request - Express request object
 * @returns IP address string
 */
export function getRealIP(request: any): string {
  // Check common proxy headers
  const xForwardedFor = request.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = xForwardedFor.split(',').map((ip: string) => ip.trim());
    return ips[0];
  }

  const xRealIP = request.headers['x-real-ip'];
  if (xRealIP) {
    return xRealIP;
  }

  // Fallback to socket remote address
  return request.connection?.remoteAddress || request.socket?.remoteAddress || '127.0.0.1';
}
