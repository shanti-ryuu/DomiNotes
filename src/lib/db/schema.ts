import { relations } from "drizzle-orm";
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  primaryKey 
} from "drizzle-orm/pg-core";

// Notes table schema
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Folders table schema
export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Many-to-many relationship between notes and folders
export const notesAndFolders = pgTable('notes_and_folders', {
  noteId: integer('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
  folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.noteId, table.folderId] })
  };
});

// PIN authentication table
export const pinAuth = pgTable('pin_auth', {
  id: serial('id').primaryKey(),
  pin: text('pin').notNull(), // Will store hashed PIN
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const notesRelations = relations(notes, ({ many }) => ({
  folders: many(notesAndFolders)
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  notes: many(notesAndFolders)
}));

export const notesAndFoldersRelations = relations(notesAndFolders, ({ one }) => ({
  note: one(notes, {
    fields: [notesAndFolders.noteId],
    references: [notes.id]
  }),
  folder: one(folders, {
    fields: [notesAndFolders.folderId],
    references: [folders.id]
  })
}));

// Types
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type NoteAndFolder = typeof notesAndFolders.$inferSelect;
export type NewNoteAndFolder = typeof notesAndFolders.$inferInsert;

export type PinAuth = typeof pinAuth.$inferSelect;
export type NewPinAuth = typeof pinAuth.$inferInsert;
