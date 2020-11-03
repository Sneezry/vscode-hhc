import * as path from 'path';
import * as vscode from 'vscode';
import {VfsProvider} from './utils/vfsprovider';

async function openPage(y?: number, m?: number, d?: number) {
	let uri: vscode.Uri;
	let todoUri: vscode.Uri;

	if (y && m && d) {
		uri = vscode.Uri.parse(`hhc://page/${y}-${m}-${d}`);
		todoUri = vscode.Uri.parse(`hhc://todo/${y}-${m}-${d}/ToDoList.md`);
	} else {
		uri = vscode.Uri.parse('hhc://page/today');
		todoUri = vscode.Uri.parse('hhc://todo/today/ToDoList.md');
	}

	await vscode.workspace.openTextDocument (uri)
		.then ( doc => vscode.window.showTextDocument ( doc, { preview: false, viewColumn: vscode.ViewColumn.One } ) );
	await vscode.workspace.openTextDocument (todoUri)
    .then ( doc => vscode.window.showTextDocument ( doc, { preview: false, viewColumn: vscode.ViewColumn.Two } ) );
}

async function openTomorrowPage() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const y = tomorrow.getFullYear();
	const m = tomorrow.getMonth() + 1;
	const d = tomorrow.getDate();
	await openPage(y, m, d);
}

async function openWeekPage() {
	const today = new Date();
	const firstTime = today.getTime() - today.getDay() * 24 * 3600 * 1000;
	for (let day = 0; day < 7; day++) {
		const currentDate = new Date(firstTime + day * 24 * 3600 * 1000);
		const y = currentDate.getFullYear();
		const m = currentDate.getMonth() + 1;
		const d = currentDate.getDate();
		if (d === today.getDate()) {
			await openPage();
		} else {
			await openPage(y, m, d);
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	const vfsProvider = new VfsProvider();
	let currentEditor: vscode.TextEditor | undefined;
	let pauseWatchEditor = false;

	let todayCommand = vscode.commands.registerCommand('hhc.today', async () => {
		currentEditor = undefined;
		pauseWatchEditor = true;
		await openPage();
		setTimeout(() => {
			pauseWatchEditor = false;
		}, 0);
	});

	let tomorrowCommand = vscode.commands.registerCommand('hhc.tomorrow', async () => {
		currentEditor = undefined;
		pauseWatchEditor = true;
		await openTomorrowPage();
		setTimeout(() => {
			pauseWatchEditor = false;
		}, 0);
	});

	let weekCommand = vscode.commands.registerCommand('hhc.week', async () => {
		currentEditor = undefined;
		pauseWatchEditor = true;
		await openWeekPage();
		setTimeout(() => {
			pauseWatchEditor = false;
		}, 0);
	});

	let fsProvider = vscode.workspace.registerFileSystemProvider('hhc', vfsProvider, { isCaseSensitive: false, isReadonly: false });

	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	statusBar.text = '今日日历';
	statusBar.tooltip = 'Happy Hacking Calendar';
	statusBar.command = 'hhc.today';
	statusBar.show();

	context.subscriptions.push(todayCommand, tomorrowCommand, weekCommand, fsProvider, statusBar);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (!pauseWatchEditor && editor && editor.document.uri.scheme === 'hhc') {
			currentEditor = editor;
		}
	});

	setInterval(async () => {
		if (!currentEditor) {
			return;
		}

		const view = currentEditor.viewColumn;
		const page = currentEditor.document.uri.authority;
		const docPath = currentEditor.document.uri.path;

		if (view === vscode.ViewColumn.One && page === 'page' || view === vscode.ViewColumn.Two && page === 'todo') {
			const dateMatch = docPath.match(/(\d+)\-(\d+)\-(\d+)/);
			currentEditor = undefined;
			pauseWatchEditor = true;
			
			if (!dateMatch) {
				await openPage();
			} else {
				const y = Number(dateMatch[1]);
				const m = Number(dateMatch[2]);
				const d = Number(dateMatch[3]);
				await openPage(y, m, d);
			}
			
			setTimeout(() => {
				pauseWatchEditor = false;
			}, 0);
		}
	}, 1000);
}

export function deactivate() {}
