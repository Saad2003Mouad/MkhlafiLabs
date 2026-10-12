// @mikhlafi-labs/integrations — External ERP Adapters & Connectors
// Safe, read-only connectors for Oracle, SAP, Microsoft Dynamics & CSV/Excel batches

export class IntegrationConnector {
  static getSupportedConnectors() {
    return [
      { id: 'csv-excel-template', name: 'Standard Excel/CSV Batch Ingestion', latency: 'Scheduled' },
      { id: 'rest-api-webhook', name: 'Enterprise Secure Webhook API', latency: 'Near Real-Time' },
      { id: 'database-read-replica', name: 'Direct Read-Only DB Replica (Air-Gapped)', latency: 'Batch Real-Time' }
    ];
  }
}
