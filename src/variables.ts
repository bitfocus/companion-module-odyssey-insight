import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'channelStatus', name: 'ChannelStatus' },
		{ variableId: 'channelName', name: 'ChannelName' },
	])
}
