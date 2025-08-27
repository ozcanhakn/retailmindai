import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, bigint } from "drizzle-orm/pg-core";


export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  // Extended metadata for end-to-end pipeline
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  status: text("status"), // pending/uploaded/processing/completed/failed
  schemaHash: text("schema_hash"),
  columns: jsonb("columns"),
  rowCount: integer("row_count"),
  error: text("error"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Stores individual analysis results per file.
export const analysisResults = pgTable("analysis_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id").notNull().references(() => uploadedFiles.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type").notNull(),
  resultJson: jsonb("result_json").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Text chunks derived from analysis summaries and data preview rows
export const chunks = pgTable("chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id").notNull().references(() => uploadedFiles.id, { onDelete: "cascade" }),
  chunkText: text("chunk_text").notNull(),
  chunkType: text("chunk_type").notNull(), // analysis | row
  source: text("source"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Embeddings for chunks; vector stored as JSON array for simplicity
export const embeddings = pgTable("embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id").notNull().references(() => uploadedFiles.id, { onDelete: "cascade" }),
  chunkId: uuid("chunk_id").notNull().references(() => chunks.id, { onDelete: "cascade" }),
  vector: jsonb("vector"),
  vectorStore: text("vector_store"), // e.g., 'local-json', 'pg', 'pinecone'
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});
