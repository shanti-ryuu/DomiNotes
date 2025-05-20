import { Note as DrizzleNote, Folder } from "./db/schema";

// Extended Note type with folders
export interface ExtendedNote extends DrizzleNote {
  folders?: Folder[];
}

// Extended Folder type with notes
export interface ExtendedFolder extends Folder {
  notes?: DrizzleNote[];
}
