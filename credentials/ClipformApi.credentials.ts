import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Clipform API key credential. Works on n8n Cloud and self-hosted alike - a key
 * is instance-agnostic (no OAuth redirect URI to register). Create one in the
 * Clipform dashboard under Developer -> API keys.
 */
export class ClipformApi implements ICredentialType {
	name = 'clipformApi';

	displayName = 'Clipform API';

	documentationUrl = 'https://clipform.io/docs/api-reference/api-keys';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Clipform API key (starts with cf_). Create one under Developer -> API keys in the Clipform dashboard.',
		},
	];

	// Sends the key as a Bearer token on every request the node makes.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Verifies the key when the credential is saved.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.clipform.io',
			url: '/v1/connect/me',
		},
	};
}
