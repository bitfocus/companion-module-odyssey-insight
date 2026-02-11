import { combineRgb } from '@companion-module/base'
import { CompanionBooleanFeedbackDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		'insightStatusDisconnected':  getChannelStatusFeedback('insightStatusDisconnected', 'Disconnected', self),
		'insightStatusPlay':          getChannelStatusFeedback('insightStatusPlay',         'Playing',      self),
		'insightStatusCue':           getChannelStatusFeedback('insightStatusCue',          'Cued',         self),
		'insightStatusStop':          getChannelStatusFeedback('insightStatusStop',         'Stopped',      self),
		'insightChannelName':         getChannelNameFeedback('insightChannelName', self)
	})
}

function getChannelStatusFeedback(name: string, state : string, self: ModuleInstance): CompanionBooleanFeedbackDefinition
{
	return {
		type: 'boolean',
		name: name,
		description: '',
		defaultStyle: {
			bgcolor: combineRgb(255, 255, 255),
			color:   combineRgb(0, 0, 0),
		},
		options: [
		{
			type:    'textinput',
			label:   'text',	
			id:      'text',
			default: '',
			useVariables: true
		}			
		],
		callback: (feedback, context) => {
			return new Promise((resolve, reject) => {
				reject;
				feedback;
				context;
				var val = self.getVariableValue('channelStatus') as string;
				resolve(val == state);
			})
		}
	}
}

function getChannelNameFeedback(name: string, self: ModuleInstance): CompanionBooleanFeedbackDefinition
{
	return {
		type: 'boolean',
		name: name,
		description: '',
		defaultStyle: {
			bgcolor: combineRgb(255, 255, 255),
			color:   combineRgb(0, 0, 0),
		},
		options: [
		{
			type:    'textinput',
			label:   'text',	
			id:      'text',
			default: '',
			useVariables: true
		}			
		],
		callback: (feedback, context) => {
			return new Promise((resolve, reject) => {
				feedback;
				context;
				resolve;
				reject;
				self;
				return true; // always returns true because notification is sent on name change only.
			})
		}
	}
}
