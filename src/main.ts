import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import axios, { AxiosError, AxiosResponse } from "axios";

type InsightStatus = 'Playing' | 'Cued' | 'Stopped' | 'Disconnected';

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!:                  ModuleConfig // Setup in init()
	statusUpdateHandle :      NodeJS.Timeout | null = null;
	lastStatus :              InsightStatus | null = null;
	lastChannelName :         string | null = null;
	updateRequestInProgress : boolean = false;
	private requestToken :    string = '';


	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.initializeWebClient();
		this.initializeStatusUpdate();
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.stopStatusUpdate();
		this.log('debug', 'destroy');
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.initializeWebClient();
		this.updatePresets();
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		this.log('info', "Update variable definitions in")
		UpdateVariableDefinitions(this)
	}

	initializeWebClient(): void {
		this.requestToken = this.config.authToken.replace(/\p{Cf}/gu, "");
	}

	getInsightChannelCommand(commandName: string) : string {
		return `http://${this.config.host}/Insight/Api/Channels/${commandName}?channelID=${this.config.channelID}`;
	}




	requestCommand(commandName: string): Promise<any>  {
		var url = this.getInsightChannelCommand(commandName);
		var promise = axios.post(url, undefined, {
			headers: {
				"Authorization": `Bearer ${this.requestToken}`
			},
			timeout: 5000
		})
		.then(response => {
			this.log('debug', `Response ${response.status} ${response.statusText} ${JSON.stringify(response.data)}`)
			return response;
		},
		reject => {
			const errorData = reject as AxiosError;
			return Promise.resolve(`Error: ${errorData.code} ${errorData.message}`)
		}
		)
		.catch(error => { this.log('info', `Request command got error ${error}`); return error; })
		return promise;
	}

	sendCommand(commandName: string): void {
		try {
			this.requestCommand(commandName);
		}
		catch(e) {
			if(axios.isAxiosError(e)) {
				const error = e as AxiosError;
				this.log('error', `Error data: ${error.message}`)
				if(error.response) {
					this.log('error', `status: ${error.response.statusText} ${error.response.data}`)
				}
			}
			else {
				this.log("error", `Exception doing send command: ${e}`)
			}
		}
	}

	async initializeStatusUpdate(): Promise<void> {
		this.statusUpdateHandle = setInterval(async () =>  { 
				try {
					if(this.updateRequestInProgress == false) {
						this.updateRequestInProgress = true;
						await this.doStatusUpdate(); 
					}
				}
				catch(e) {
					this.log('info', `Error occurred in interval update. ${e}`)
				}
				finally {
					this.updateRequestInProgress = false;
				}
			}, 
			this.config.refreshPeriod
		)
	}

	async doStatusUpdate(): Promise<void> {
		return this.requestCommand('Status')
			.then(response => { 
				response = response as Promise<AxiosResponse<any, any, {} > >;
				if(typeof response === 'object') {
					this.log('debug', `http response: ${response} ${response.status} `)
					if(response.data.Status != this.lastStatus) {
						this.setVariableValues({
							channelStatus: response.data.Status,
						})
						this.lastStatus = response.data.Status;
						this.checkFeedbacks('insightStatusPlay', 'insightStatusCue', 'insightStatusStop', 'insightStatusDisconnected');
					}
					if(response.data.Name != this.lastChannelName) {
						this.setVariableValues({
							channelName:   response.data.Name
						})
						this.lastChannelName = response.data.Name;
						this.checkFeedbacks('insightChannelName');
					}
				}
				else {
					this.log('warn', `${response}.`)
					this.setVariableValues({
						channelName: 'No link',
						channelStatus: 'Disconnected'
					})
					this.lastChannelName = 'No link'
					this.lastStatus = 'Disconnected'
					this.checkFeedbacks('insightStatusPlay', 'insightStatusCue', 'insightStatusStop', 'insightStatusDisconnected', 'insightChannelName');
				}
			})
	}

	stopStatusUpdate(): void {
		if(this.statusUpdateHandle) {
			clearInterval(this.statusUpdateHandle);
			this.statusUpdateHandle = null;
		}
	}

}



runEntrypoint(ModuleInstance, UpgradeScripts)
