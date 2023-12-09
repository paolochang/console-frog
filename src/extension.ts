// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { includes, startsWith } from "lodash";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("🐸 is now active!");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("frog.consoleLog", () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const selection = editor.selection;
      const variableName = editor.document.getText(selection);

      // Get the current position and line number
      const position = editor.selection.active;

      // Calculate position for inserting the log statement
      const [newLine, numIndent] = getConsolePosition(
        editor,
        selection.active.line
      );

      const newPosition = position.with(newLine, 0);

      // Construct the log statement
      const newIndent = " ".repeat(numIndent);
      const logStatement = `${newIndent}console.log("${variableName}:", ${variableName});\n`;

      // Insert the log statement at the calculated position
      editor.edit((editBuilder) => {
        editBuilder.insert(newPosition, logStatement);
      });
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Return pure code without comments
function getCleanCode(input: string): string {
  let text = input;
  let withinString = false;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"' || text[i] === "'") {
      withinString = !withinString;
    }

    if (!withinString && text.slice(i).startsWith("//")) {
      text = text.slice(0, i).trim();
      break;
    }
  }

  return text;
}

function getEndLine(
  editor: vscode.TextEditor,
  lineNumber: number
): [number, number] {
  let char = "";
  let code = "";
  let lineCount = lineNumber;
  let lineIndent = 0;

  while (
    char !== ";" &&
    char !== "{" &&
    char !== ":" &&
    !startsWith(code, "return")
  ) {
    const next = editor.document.lineAt(lineCount);
    code = getCleanCode(next.text).trim();
    char = code.charAt(code.length - 1);
    lineIndent = next.firstNonWhitespaceCharacterIndex;

    lineCount += 1;
    if (char === "{" || char === ":") {
      const startLine = editor.document.lineAt(lineCount);
      if (startsWith(startLine.text.trimStart(), "case")) {
        char = "";
      }
      lineIndent = startLine.firstNonWhitespaceCharacterIndex;
    }
  }

  return [lineCount, lineIndent];
}

function getConsolePosition(
  editor: vscode.TextEditor,
  lineNumber: number
): [number, number] {
  const line = editor.document.lineAt(lineNumber);

  const validCode = getCleanCode(line.text);

  if (startsWith(validCode.trimStart(), "return")) {
    return [lineNumber, line.firstNonWhitespaceCharacterIndex];
  }

  return getEndLine(editor, lineNumber);
}
