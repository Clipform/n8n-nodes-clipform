import type {
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

const BASE_URL = 'https://api.clipform.io';

/**
 * Trigger node: starts a workflow whenever a Clipform form is completed.
 *
 * Uses Clipform's connect webhook lane (the same one Zapier/Make use): on
 * activation it registers n8n's webhook URL via POST /v1/connect/hooks and
 * stores the returned subscription id; on deactivation it deletes it. The
 * subscription is workspace-wide - every form's completion fires it - so the
 * payload's form_id / form_name / form_tags are used to filter downstream.
 */
export class ClipformTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clipform Trigger',
		name: 'clipformTrigger',
		icon: 'file:clipform.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when a Clipform form is completed',
		defaults: {
			name: 'Clipform Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'clipformApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'This trigger fires for every completed form in your workspace. Use the <code>form_id</code> / <code>form_name</code> / <code>form_tags</code> fields in the output to filter to a specific form.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return Boolean(webhookData.hookId);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'clipformApi',
					{
						method: 'POST',
						baseURL: BASE_URL,
						url: '/v1/connect/hooks',
						body: { targetUrl: webhookUrl },
						json: true,
					},
				)) as IDataObject;

				if (!response?.id) {
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.hookId = response.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.hookId) {
					return true;
				}

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'clipformApi', {
						method: 'DELETE',
						baseURL: BASE_URL,
						url: `/v1/connect/hooks/${webhookData.hookId}`,
					});
				} catch (error) {
					return false;
				}

				delete webhookData.hookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(body as IDataObject)],
		};
	}
}
