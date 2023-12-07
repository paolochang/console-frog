// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

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

      // Construct the log statement
      const logStatement = `console.log("${variableName}:", ${variableName});\n`;

      // Get the current position and line number
      const position = editor.selection.active;
      const lineNumber = position.line;

      // Calculate position for inserting the log statement on the next line
      const newPosition = position.with(lineNumber + 1, 0); // Next line

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
