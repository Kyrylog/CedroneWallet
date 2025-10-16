import { createActor, type backendInterface, type CreateActorOptions, ExternalBlob } from './backend';
import { StorageClient } from './utils/StorageClient';
import { HttpAgent } from '@icp-sdk/core/agent';

const DEFAULT_STORAGE_GATEWAY_URL = 'https://blob.caffeine.ai';
const DEFAULT_BUCKET_NAME = 'default-bucket';
const DEFAULT_PROJECT_ID = '0000000-0000-0000-0000-00000000000';

interface JsonConfig {
    backend_host: string;
    backend_canister_id: string;
    project_id: string;
    ii_derivation_origin: string;
}

interface Config {
    backend_host?: string;
    backend_canister_id: string;
    storage_gateway_url: string;
    bucket_name: string;
    project_id: string;
    ii_derivation_origin?: string;
}

let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
    if (configCache) {
        return configCache;
    }
    const backendCanisterId = process.env.CANISTER_ID_BACKEND;
    try {
        const response = await fetch('./env.json');
        const config = (await response.json()) as JsonConfig;
        if (!backendCanisterId && config.backend_canister_id === 'undefined') {
            console.error('CANISTER_ID_BACKEND is not set');
            throw new Error('CANISTER_ID_BACKEND is not set');
        }

        const fullConfig = {
            backend_host: config.backend_host == 'undefined' ? undefined : config.backend_host,
            backend_canister_id: (config.backend_canister_id == 'undefined'
                ? backendCanisterId
                : config.backend_canister_id) as string,
            storage_gateway_url: process.env.STORAGE_GATEWAY_URL ?? 'nogateway',
            bucket_name: DEFAULT_BUCKET_NAME,
            project_id: config.project_id !== 'undefined' ? config.project_id : DEFAULT_PROJECT_ID,
            ii_derivation_origin: config.ii_derivation_origin == 'undefined' ? undefined : config.ii_derivation_origin
        };
        configCache = fullConfig;
        return fullConfig;
    } catch {
        if (!backendCanisterId) {
            console.error('CANISTER_ID_BACKEND is not set');
            throw new Error('CANISTER_ID_BACKEND is not set');
        }
        const fallbackConfig = {
            backend_host: undefined,
            backend_canister_id: backendCanisterId,
            storage_gateway_url: DEFAULT_STORAGE_GATEWAY_URL,
            bucket_name: DEFAULT_BUCKET_NAME,
            project_id: DEFAULT_PROJECT_ID,
            ii_derivation_origin: undefined
        };
        return fallbackConfig;
    }
}

function extractAgentErrorMessage(error: string): string {
    const errorString = String(error);
    const match = errorString.match(/with message:\s*'([^']+)'/s);
    return match ? match[1] : errorString;
}

function processError(e: unknown): never {
    if (e && typeof e === 'object' && 'message' in e) {
        throw new Error(extractAgentErrorMessage(e['message'] as string));
    } else throw e;
}

export async function createActorWithConfig(options?: CreateActorOptions): Promise<backendInterface> {
    const config = await loadConfig();
    if (!options) {
        options = {};
    }
    const agent = new HttpAgent({
        ...options.agentOptions,
        host: config.backend_host
    });
    if (config.backend_host?.includes('localhost')) {
        await agent.fetchRootKey().catch((err) => {
            console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
            console.error(err);
        });
    }
    options = {
        ...options,
        agent: agent,
        processError
    };

    const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent
    );

    const MOTOKO_DEDUPLICATION_SENTINEL = '!caf!';

    const uploadFile = async (file: ExternalBlob): Promise<Uint8Array> => {
        const { hash } = await storageClient.putFile(await file.getBytes(), file.onProgress);
        return new TextEncoder().encode(MOTOKO_DEDUPLICATION_SENTINEL + hash);
    };

    const downloadFile = async (bytes: Uint8Array): Promise<ExternalBlob> => {
        const hashWithPrefix = new TextDecoder().decode(new Uint8Array(bytes));
        const hash = hashWithPrefix.substring(MOTOKO_DEDUPLICATION_SENTINEL.length);
        const url = await storageClient.getDirectURL(hash);
        return ExternalBlob.fromURL(url);
    };

    return createActor(config.backend_canister_id, uploadFile, downloadFile, options);
}
