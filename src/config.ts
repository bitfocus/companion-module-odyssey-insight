import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host:            string
	authToken:       string
	channelID:       number
	refreshPeriod:   number,
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'authToken',
			label: 'Authorization Key',
			width: 400,
			default: ''
		},
		{
			type: 'number',
			id: 'channelID',
			label: 'Channel',
			width: 4,
			min: 1,
			max: 12,
			default: 1,
		},
		{
			type: 'number',
			id: 'refreshPeriod',
			label: 'Status refresh period',
			width: 4,
			min: 100,
			max: 2000,
			default: 500,
		},
	]
}
