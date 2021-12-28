import { GoogleSpreadsheet } from 'google-spreadsheet';

import { StatsBase } from './types';

export class StatsStorage {
  doc: GoogleSpreadsheet;
  sheetId: string;
  googleClientEmail: string;
  googleClientPrivateKey: string;

  constructor(
    sheetId: string,
    googleClientEmail: string,
    googleClientPrivateKey: string
  ) {
    this.sheetId = sheetId;
    this.googleClientEmail = googleClientEmail;
    this.googleClientPrivateKey = googleClientPrivateKey;
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.doc) {
      this.doc = new GoogleSpreadsheet(this.sheetId);
      await this.doc.useServiceAccountAuth({
        client_email: this.googleClientEmail,
        private_key: this.googleClientPrivateKey,
      });
      await this.doc.loadInfo();
    }
  }

  /**
   * Can be executed locally to create new Google sheet table structure
   */
  async createTables(entities: StatsBase[]): Promise<void> {
    await this.ensureAuthenticated();

    for (const stat of entities) {
      try {
        await this.doc.addSheet({
          title: stat.tableName,
          headerValues: stat.columnNames,
        });
      } catch (e: any) {
        throw new Error(`Failed to add table to the sheet: ${e.message}`);
      }
    }
  }

  async storeStats(stats: StatsBase): Promise<void> {
    await this.ensureAuthenticated();

    try {
      const table = this.doc.sheetsByTitle[stats.tableName];
      await table.addRow(stats.asRow());
    } catch (e: any) {
      throw new Error(`Failed to insert data table to the sheet: ${e.message}`);
    }
  }
}
