import { Request, Response, NextFunction } from 'express';

export class MockDataController {
  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      // Generate 20 randomized pacs.008-like payment records
      const statuses = ['ACCP', 'RJCT', 'PDNG', 'SETT'];
      const currencies = ['USD', 'EUR', 'GBP', 'INR'];
      
      const records = Array.from({ length: 20 }, (_, i) => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
        const randomAmount = (Math.random() * 10000 + 100).toFixed(2);
        
        return {
          MsgId: `MSG-${Date.now()}-${i}`,
          TxId: `TX-${Math.random().toString(36).substring(7).toUpperCase()}`,
          IntrBkSttlmAmt: {
            value: parseFloat(randomAmount),
            currency: randomCurrency
          },
          Sts: randomStatus,
          Dbtr: { Nm: `Debtor Corp ${i + 1}` },
          Cdtr: { Nm: `Creditor Solutions ${i + 1}` },
          CreDtTm: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
        };
      });

      res.status(200).json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }
}
