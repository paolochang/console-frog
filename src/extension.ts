// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { includes } from "lodash";

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

      const [newLine, newIndent] = getConsolePosition(
        editor,
        selection.active.line
      );

      // Calculate position for inserting the log statement on the next line
      const newPosition = position.with(newLine, 0); // Next line

      // Construct the log statement
      const logStatement = `${" ".repeat(
        newIndent
      )}console.log("${variableName}:", ${variableName});\n`;

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

// TODO: Handle double slashes in the middle of code as string
function getValidCode(text: string): string {
  if (includes(text, "//")) {
    const startAt = text.indexOf("//");
    text = text.slice(0, startAt).trim();
  }
  return text;
}

function getEndLine(editor: vscode.TextEditor, lineNumber: number): number[] {
  let char = undefined;
  let lineCount = lineNumber;
  let lineIndent = 0;

  while (char !== ";") {
    lineCount += 1;
    const next = editor.document.lineAt(lineCount);
    const code = getValidCode(next.text);
    char = code.charAt(code.length - 1);
    lineIndent = next.firstNonWhitespaceCharacterIndex;
  }

  return [lineCount, lineIndent];
}

function getConsolePosition(
  editor: vscode.TextEditor,
  lineNumber: number
): number[] {
  const line = editor.document.lineAt(lineNumber);
  const nextLine = editor.document.lineAt(lineNumber + 1);

  const validCode = getValidCode(line.text);

  const lastChar = validCode.charAt(validCode.length - 1);

  switch (lastChar) {
    case "{":
      console.log("Next Line", lineNumber + 1);
      return [lineNumber + 1, nextLine.firstNonWhitespaceCharacterIndex];

    case ";":
      return [lineNumber + 1, line.firstNonWhitespaceCharacterIndex];

    case "(":
    default:
      const [lineCount, lineIndent] = getEndLine(editor, lineNumber);
      return [lineCount + 1, lineIndent];
  }
}
