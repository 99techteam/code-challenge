
function getClientIp(ip) {
  // Convert IPv6 localhost (::1) to IPv4 localhost
  if (ip === '::1') return '127.0.0.1';

  // Strip IPv6 prefix if it's an IPv4-mapped address (::ffff:192.168.1.10)
  if (ip.startsWith('::ffff:')) return ip.split('::ffff:')[1];

  return ip;
}

export default getClientIp