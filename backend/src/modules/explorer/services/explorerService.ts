// This is a Mock Data Service simulating connected data sources (e.g., ISO 20022 APIs)
export class ExplorerService {
  static generateMockPacs008(count: number) {
    const data = [];
    const statuses = ['ACCP', 'RJCT', 'PDNG', 'ACSP'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

    for (let i = 0; i < count; i++) {
      data.push({
        _id: `MSG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        MsgId: `MsgID-${Date.now()}-${i}`,
        CreDtTm: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        TxId: `TxID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        EndToEndId: `E2E-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        IntrBkSttlmAmt: {
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          value: parseFloat((Math.random() * 10000).toFixed(2))
        },
        Sts: statuses[Math.floor(Math.random() * statuses.length)],
        Dbtr: {
          Nm: `Corporate Client ${Math.floor(Math.random() * 100)}`,
          Acct: `ACC-${Math.floor(Math.random() * 1000000000)}`
        },
        Cdtr: {
          Nm: `Vendor Supplier ${Math.floor(Math.random() * 100)}`,
          Acct: `ACC-${Math.floor(Math.random() * 1000000000)}`
        }
      });
    }
    return data;
  }

  static async getMockData(schemaName: string, page: number, limit: number, sortBy?: string, sortOrder?: string) {
    // Generate some mock data
    let data = [];
    if (schemaName === 'pacs.008') {
      data = this.generateMockPacs008(150); // Gen 150 records
    } else {
      // Generic fallback
      data = Array.from({ length: 50 }).map((_, i) => ({ id: i, name: `Record ${i}` }));
    }

    // Apply sorting
    if (sortBy) {
      data.sort((a: any, b: any) => {
        const valA = sortBy.split('.').reduce((o, i) => (o ? o[i] : null), a);
        const valB = sortBy.split('.').reduce((o, i) => (o ? o[i] : null), b);
        
        if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
        if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);

    return {
      total: data.length,
      page,
      limit,
      data: paginatedData
    };
  }
}
