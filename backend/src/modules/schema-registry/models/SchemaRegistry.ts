import mongoose, { Schema, Document } from 'mongoose';

export interface ISchemaField {
  fieldName: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'OBJECT' | 'ARRAY';
  description?: string;
  isFilterable: boolean;
  path: string; // JSONPath to the field
}

export interface ISchemaRegistry extends Document {
  dataSourceId: mongoose.Types.ObjectId;
  schemaName: string; // e.g., 'pacs.008', 'Invoice'
  endpoint: string;
  fields: ISchemaField[];
  version: number;
  lastDiscovered: Date;
}

const SchemaFieldSchema = new Schema({
  fieldName: { type: String, required: true },
  dataType: { type: String, enum: ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'OBJECT', 'ARRAY'], required: true },
  description: { type: String },
  isFilterable: { type: Boolean, default: true },
  path: { type: String, required: true }
}, { _id: false });

const SchemaRegistrySchema: Schema = new Schema(
  {
    dataSourceId: { type: Schema.Types.ObjectId, ref: 'DataSource', required: true },
    schemaName: { type: String, required: true },
    endpoint: { type: String, required: true },
    fields: [SchemaFieldSchema],
    version: { type: Number, default: 1 },
    lastDiscovered: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SchemaRegistry = mongoose.model<ISchemaRegistry>('SchemaRegistry', SchemaRegistrySchema);
