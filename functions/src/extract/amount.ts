import { Extractor } from './extractor';
import { Receipt } from './receipt';

export interface Amount {
  value: number;
  currency: 'EUR' | 'USD' | 'GBP';
}

export class AmountExtractor extends Extractor {
  constructor() {
    super('amount');
  }

  public extract(text: string, lines: string[], extracted: Receipt): Amount | null {
    let m = text.match(/gesamt(?:\s+EUR)?(?:\s*|$)(\d+,\d\d).*$/im);
    if (m) {
      return {
        value: parseFloat(m[1].replace(',', '.')),
        currency: 'EUR',
      } as Amount;
    }

    m = text.match(/betrag(?:\s+EUR)?(?:\s*|$)(\d+,\d\d).*$/im);
    if (m) {
      return {
        value: parseFloat(m[1].replace(',', '.')),
        currency: 'EUR',
      } as Amount;
    }
    const maxAmount = lines
      .map<any>((line) => line.match(/^\d+[,.]\d{2}$/))
      .filter((line) => !!line)
      .map(([amount]) => parseFloat(amount.replace(',', '.')))
      .reduce((max: number | null, cur) => {
        return !max || cur > max ? cur : max;
      }, null);
    if (maxAmount) {
      return {
        value: maxAmount,
        currency: 'EUR',
      };
    }
    return null;
  }
}
