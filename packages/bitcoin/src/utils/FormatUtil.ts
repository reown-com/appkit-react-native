export const FormatUtil = {
  normalizeSignature(signature: string): { hex: string; base64: string } {
    let raw: Buffer;

    try {
      // Try hex first
      raw = Buffer.from(signature, 'hex');
      if (raw.length > 0 && /^[0-9a-fA-F]+$/.test(signature)) {
        return {
          hex: signature,
          base64: raw.toString('base64')
        };
      }
    } catch {
      // ignore and try base64
    }

    try {
      // Fallback: assume base64
      raw = Buffer.from(signature, 'base64');
      if (raw.length > 0) {
        return {
          hex: raw.toString('hex'),
          base64: signature
        };
      }
    } catch {
      // ignore
    }

    throw new Error('Unsupported signature format: expected hex or base64');
  }
};
