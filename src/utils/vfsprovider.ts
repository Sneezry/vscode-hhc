import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Calendar} from './calendar';

export class VfsProvider implements vscode.FileSystemProvider {
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = (new vscode.EventEmitter<vscode.FileChangeEvent[]>()).event;

  watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
    return {
      dispose: () => {}
    };
  }
  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    return {
      type: vscode.FileType.File,
      ctime: 0,
      mtime: 0,
      size: 0,
    };
  }
  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    return [];
  }
  createDirectory(uri: vscode.Uri): void | Thenable<void> {}
  writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
    if (/todo/.test(uri.authority)) {
      let dateMatch = uri.path.match(/\d+\-\d+\-\d+/);
      let date: string;
      if (!dateMatch) {
        let y = new Date().getFullYear();
        let m = new Date().getMonth() + 1;
        let d = new Date().getDate();
        date = `${y}-${m}-${d}`;
      } else {
        date = dateMatch[0];
      }

      const homedir = require('os').homedir();
      const hhcTodoDir = path.join(homedir, '.happyhackingcalendar');
      if (!fs.existsSync(hhcTodoDir)){
        fs.mkdirSync(hhcTodoDir);
      }
      const dateDir = path.join(hhcTodoDir, date);
      if (!fs.existsSync(dateDir)){
        fs.mkdirSync(dateDir);
      }

      const filePath = path.join(dateDir, 'ToDoList.md');
      fs.writeFileSync(filePath, content);
    }
  }
  delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {}
  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {}

  
  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    let content = '';

    if (/today/.test(uri.path)) {
      const y = new Date().getFullYear();
      const m = new Date().getMonth() + 1;
      const d = new Date().getDate();

      if (/todo/.test(uri.authority)) {
        const homedir = require('os').homedir();
        const todolistPath = path.join(homedir, '.happyhackingcalendar', `${y}-${m}-${d}`, 'ToDoList.md');
        if (fs.existsSync(todolistPath)){
          content = fs.readFileSync(todolistPath, 'utf8');
        }
      } else {
        content = Calendar.today();
      }
    } else {
      const dateMatch = uri.path.match(/(\d+)\-(\d+)\-(\d+)/);
      const y = dateMatch ? Number(dateMatch[1]) : 2021;
      const m = dateMatch ? Number(dateMatch[2]) : 1;
      const d = dateMatch ? Number(dateMatch[3]) : 1;

      if (/todo/.test(uri.authority)) {
        const homedir = require('os').homedir();
        const todolistPath = path.join(homedir, '.happyhackingcalendar', `${y}-${m}-${d}`, 'ToDoList.md');
        if (fs.existsSync(todolistPath)){
          content = fs.readFileSync(todolistPath, 'utf8');
        }
      } else {
        content = Calendar.page(y, m, d);
      }
    }
    
    const buffer = Buffer.from(content, 'utf8');
    return new Uint8Array(buffer);
  }
}