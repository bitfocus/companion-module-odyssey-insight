import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		play_action: {
			name: 'Play',
			options: [
			],
//			callback: async (event) => {
			callback: async () => {
				self.sendCommand('Play');
			},
		},
		stop_action: {
			name: 'Stop',
			options: [
			],
			callback: async () => {
				self.sendCommand('Stop');
			},
		},
		previous_action: {
			name: 'Previous',
			options: [
			],
			callback: async () => {
				self.sendCommand('Previous');
			},
		},
		next_action: {
			name: 'Next',
			options: [
			],
			callback: async () => {
				self.sendCommand('Next');
			},
		},
		pause_action: {
			name: 'Pause',
			options: [
			],
			callback: async () => {
				self.sendCommand('Pause');
			},
		},
		cue_action: {
			name: 'Cue',
			options: [
			],
			callback: async () => {
				self.sendCommand('Cue');
			},
		},
		updateStatus_action: {
			name: 'Status',
			options: [
			],
			callback: async () => {
				self.requestCommand('Status')
					.then(response => { 
						self.log('info', `status is ${response.data.Status}`)
						self.setVariableValues({
							channelStatus: response.data.Status,
							channelName:   response.data.Name
						})
						self.checkFeedbacks('insightStatusPlay', 'insightStatusCue', 'insightStatusStop');
					})
			},
		},
	})
}

