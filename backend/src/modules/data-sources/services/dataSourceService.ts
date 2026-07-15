import { DataSource } from '../models/DataSource';
import axios from 'axios';
import { decrypt } from '../../../shared/utils/encryption';

export class DataSourceService {
  static async createDataSource(data: any, userId: string) {
    const dataSource = new DataSource({ ...data, createdBy: userId });
    await dataSource.save();
    return dataSource;
  }

  static async getAllDataSources() {
    return await DataSource.find().select('-authentication.credentials');
  }

  static async testConnection(dataSourceId: string) {
    const ds = await DataSource.findById(dataSourceId);
    if (!ds) throw new Error('DataSource not found');

    const headers: any = {};
    if (ds.authentication.type === 'BEARER_TOKEN' && ds.authentication.credentials) {
      const token = decrypt(ds.authentication.credentials);
      headers['Authorization'] = `Bearer ${token}`;
    } else if (ds.authentication.type === 'API_KEY' && ds.authentication.credentials) {
      const key = decrypt(ds.authentication.credentials);
      headers['x-api-key'] = key; // Simple mapping, could be dynamic
    }

    try {
      // Just a simple ping to the baseUrl or a known health endpoint
      // In a real system, you'd ping a specific test endpoint
      const response = await axios.get(ds.baseUrl, { headers, timeout: 5000 });
      return { success: true, status: response.status };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
