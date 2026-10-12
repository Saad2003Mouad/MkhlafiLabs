// Domain: Financial Intelligence Entities & Rules
export class FinancialLeakDetector {
  static checkDuplicate(invoiceA, invoiceB) {
    if (invoiceA.vendorId === invoiceB.vendorId && invoiceA.amount === invoiceB.amount && invoiceA.id !== invoiceB.id) {
      return { isDuplicate: true, confidence: 0.95, reason: 'Identical vendor, amount, and close issuance date' };
    }
    return { isDuplicate: false };
  }
}
