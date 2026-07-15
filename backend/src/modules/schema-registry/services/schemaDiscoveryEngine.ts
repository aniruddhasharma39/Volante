import { SchemaRegistry, ISchemaField } from '../models/SchemaRegistry';

export class SchemaDiscoveryEngine {
  /**
   * Discovers schema fields from a JSON sample
   */
  static discoverFromJSON(jsonSample: any, prefix = '$'): ISchemaField[] {
    let fields: ISchemaField[] = [];

    const traverse = (obj: any, currentPath: string) => {
      if (obj === null || obj === undefined) return;

      if (Array.isArray(obj)) {
        if (obj.length > 0) {
          // Analyze first item in array
          traverse(obj[0], `${currentPath}[*]`);
        }
      } else if (typeof obj === 'object') {
        for (const key in obj) {
          traverse(obj[key], `${currentPath}.${key}`);
        }
      } else {
        // Primitive value
        let dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' = 'STRING';
        if (typeof obj === 'number') dataType = 'NUMBER';
        else if (typeof obj === 'boolean') dataType = 'BOOLEAN';
        else if (typeof obj === 'string' && !isNaN(Date.parse(obj))) dataType = 'DATE';

        fields.push({
          fieldName: currentPath.split('.').pop() || 'unknown',
          dataType,
          isFilterable: true,
          path: currentPath
        });
      }
    };

    traverse(jsonSample, prefix);
    return fields;
  }

  static async saveSchema(dataSourceId: string, schemaName: string, endpoint: string, jsonSample: any) {
    const fields = this.discoverFromJSON(jsonSample);
    
    // Check if exists
    let schema = await SchemaRegistry.findOne({ dataSourceId, schemaName });
    if (schema) {
      schema.fields = fields;
      schema.version += 1;
      schema.lastDiscovered = new Date();
      await schema.save();
    } else {
      schema = new SchemaRegistry({
        dataSourceId,
        schemaName,
        endpoint,
        fields
      });
      await schema.save();
    }
    return schema;
  }

  static async getAllSchemas() {
    return await SchemaRegistry.find().populate('dataSourceId', 'name type');
  }
}
