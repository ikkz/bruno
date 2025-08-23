const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.commands.executeCommand('workbench.view.scm');
  const config =   vscode.workspace.getConfiguration();
  config.update('window.commandCenter', false, vscode.ConfigurationTarget.Global);
  config.update('workbench.layoutControl.enabled', false, vscode.ConfigurationTarget.Global);
  config.update('window.menuBarVisibility', 'compact', vscode.ConfigurationTarget.Global);
  config.update('workbench.navigationControl.enabled', false, vscode.ConfigurationTarget.Global);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
