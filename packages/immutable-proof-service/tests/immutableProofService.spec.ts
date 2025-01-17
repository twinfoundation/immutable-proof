// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	EntityStorageBackgroundTaskConnector,
	type BackgroundTask,
	initSchema as initSchemaBackgroundTask
} from "@twin.org/background-task-connector-entity-storage";
import { BackgroundTaskConnectorFactory } from "@twin.org/background-task-models";
import { RandomHelper } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	EntityStorageImmutableStorageConnector,
	type ImmutableItem,
	initSchema as initSchemaImmutableStorage
} from "@twin.org/immutable-storage-connector-entity-storage";
import { ImmutableStorageConnectorFactory } from "@twin.org/immutable-storage-models";
import { ModuleHelper } from "@twin.org/modules";
import { nameof } from "@twin.org/nameof";
import {
	cleanupTestEnv,
	setupTestEnv,
	TEST_NODE_IDENTITY,
	TEST_USER_IDENTITY
} from "./setupTestEnv";
import type { ImmutableProof } from "../src/entities/immutableProof";
import { ImmutableProofService } from "../src/immutableProofService";
import { initSchema } from "../src/schema";

let proofStorage: MemoryEntityStorageConnector<ImmutableProof>;
let immutableStorage: MemoryEntityStorageConnector<ImmutableItem>;
let backgroundTaskStorage: MemoryEntityStorageConnector<BackgroundTask>;
let backgroundTaskConnectorEntityStorage: EntityStorageBackgroundTaskConnector;

const FIRST_TICK = 1724327716271;

/**
 * Wait for the proof to be generated.
 * @param proofCount The number of proofs to wait for.
 */
async function waitForProofGeneration(proofCount: number = 1): Promise<void> {
	let count = 0;
	do {
		await new Promise(resolve => setTimeout(resolve, 200));
	} while (immutableStorage.getStore().length < proofCount && count++ < proofCount * 40);
}

describe("ImmutableProofService", () => {
	beforeAll(async () => {
		await setupTestEnv();
	});

	beforeEach(async () => {
		initSchema();
		initSchemaImmutableStorage();
		initSchemaBackgroundTask();

		proofStorage = new MemoryEntityStorageConnector<ImmutableProof>({
			entitySchema: nameof<ImmutableProof>()
		});
		EntityStorageConnectorFactory.register("immutable-proof", () => proofStorage);

		backgroundTaskStorage = new MemoryEntityStorageConnector<BackgroundTask>({
			entitySchema: nameof<BackgroundTask>()
		});
		EntityStorageConnectorFactory.register("background-task", () => backgroundTaskStorage);

		backgroundTaskConnectorEntityStorage = new EntityStorageBackgroundTaskConnector();
		BackgroundTaskConnectorFactory.register(
			"background-task",
			() => backgroundTaskConnectorEntityStorage
		);

		immutableStorage = new MemoryEntityStorageConnector<ImmutableItem>({
			entitySchema: nameof<ImmutableItem>()
		});
		EntityStorageConnectorFactory.register("immutable-item", () => immutableStorage);

		ImmutableStorageConnectorFactory.register(
			"immutable-storage",
			() => new EntityStorageImmutableStorageConnector()
		);

		Date.now = vi.fn().mockImplementation(() => FIRST_TICK);
		RandomHelper.generate = vi
			.fn()
			.mockImplementationOnce(length => new Uint8Array(length).fill(1))
			.mockImplementationOnce(length => new Uint8Array(length).fill(2))
			.mockImplementationOnce(length => new Uint8Array(length).fill(3))
			.mockImplementationOnce(length => new Uint8Array(length).fill(4))
			.mockImplementationOnce(length => new Uint8Array(length).fill(5))
			.mockImplementationOnce(length => new Uint8Array(length).fill(6))
			.mockImplementationOnce(length => new Uint8Array(length).fill(7))
			.mockImplementationOnce(length => new Uint8Array(length).fill(8))
			.mockImplementationOnce(length => new Uint8Array(length).fill(9))
			.mockImplementationOnce(length => new Uint8Array(length).fill(10))
			.mockImplementationOnce(length => new Uint8Array(length).fill(11))
			.mockImplementationOnce(length => new Uint8Array(length).fill(12))
			.mockImplementationOnce(length => new Uint8Array(length).fill(13))
			.mockImplementationOnce(length => new Uint8Array(length).fill(14))
			.mockImplementation(length => new Uint8Array(length).fill(15));

		// Mock the module helper to execute the method in the same thread, so we don't have to create an engine
		ModuleHelper.execModuleMethodThread = vi
			.fn()
			.mockImplementation(async (module, method, args) =>
				ModuleHelper.execModuleMethod(module, method, args)
			);
	});

	afterAll(async () => {
		await cleanupTestEnv();
	});

	test("Can create an instance of the service", async () => {
		const service = new ImmutableProofService();
		expect(service).toBeDefined();
	});

	test("Can create a proof that is pending", async () => {
		const service = new ImmutableProofService();

		const proofId = await service.create(
			{
				"@context": "http://schema.org/",
				type: "Person",
				id: "123",
				name: "John Smith"
			},
			TEST_USER_IDENTITY,
			TEST_NODE_IDENTITY
		);
		expect(proofId).toEqual(
			"immutable-proof:0101010101010101010101010101010101010101010101010101010101010101"
		);

		const proofStore = proofStorage.getStore();
		expect(proofStore).toEqual([
			{
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				nodeIdentity:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				userIdentity:
					"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
				dateCreated: "2024-08-22T11:55:16.271Z",
				proofObjectId: "123",
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y="
			}
		]);
	});

	test("Can get a proof that has not been issued", async () => {
		const service = new ImmutableProofService();

		const proofId = await service.create(
			{
				"@context": "http://schema.org/",
				type: "Person",
				id: "123",
				name: "John Smith"
			},
			TEST_USER_IDENTITY,
			TEST_NODE_IDENTITY
		);
		expect(proofId).toEqual(
			"immutable-proof:0101010101010101010101010101010101010101010101010101010101010101"
		);

		const proofStore = proofStorage.getStore();
		expect(proofStore).toEqual([
			{
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				nodeIdentity:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				userIdentity:
					"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
				dateCreated: "2024-08-22T11:55:16.271Z",
				proofObjectId: "123"
			}
		]);

		const proof = await service.get(proofId);
		expect(proof).toEqual({
			"@context": "https://schema.twindev.org/immutable-proof/",
			type: "ImmutableProof",
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proofObjectId: "123",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y="
		});
	});

	test("Can get a proof that has been issued", async () => {
		await backgroundTaskConnectorEntityStorage.start("");

		const service = new ImmutableProofService();

		const proofId = await service.create(
			{
				"@context": "http://schema.org/",
				type: "Person",
				id: "123",
				name: "John Smith"
			},
			TEST_USER_IDENTITY,
			TEST_NODE_IDENTITY
		);
		expect(proofId).toEqual(
			"immutable-proof:0101010101010101010101010101010101010101010101010101010101010101"
		);

		await waitForProofGeneration();

		const proofStore = proofStorage.getStore();
		expect(proofStore).toMatchObject([
			{
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				nodeIdentity:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				userIdentity:
					"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
				proofObjectId: "123",
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
				immutableStorageId:
					"immutable:entity-storage:0303030303030303030303030303030303030303030303030303030303030303"
			}
		]);

		const proof = await service.get(proofId);
		expect(proof).toMatchObject({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://w3id.org/security/data-integrity/v2",
				"https://schema.twindev.org/immutable-storage/"
			],
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proofObjectId: "123",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proof: {
				type: "DataIntegrityProof",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"5nGVyYtMuBRy6S3C2vABq6zZT1JirtDQogmHH6fC4LRALHzNnud5n2wC3eWECxtnXXpda1tcRoLuJEExCxDfi7Rr",
				verificationMethod:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363#immutable-proof-assertion"
			},
			immutableReceipt: {
				type: "ImmutableStorageEntityStorageReceipt"
			}
		});

		const immutableStore = immutableStorage.getStore();
		expect(immutableStore).toMatchObject([
			{
				id: "0303030303030303030303030303030303030303030303030303030303030303",
				controller:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363"
			}
		]);
	});

	test("Can verify a proof that has not been issued", async () => {
		const service = new ImmutableProofService();

		const proofObject = {
			"@context": "http://schema.org/",
			type: "Person",
			id: "123",
			name: "John Smith"
		};

		const proofId = await service.create(proofObject, TEST_USER_IDENTITY, TEST_NODE_IDENTITY);
		expect(proofId).toEqual(
			"immutable-proof:0101010101010101010101010101010101010101010101010101010101010101"
		);

		const proof = await service.get(proofId);
		expect(proof).toEqual({
			"@context": "https://schema.twindev.org/immutable-proof/",
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proofObjectId: "123",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858"
		});

		const proofStore = proofStorage.getStore();
		expect(proofStore).toEqual([
			{
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				nodeIdentity:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				userIdentity:
					"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
				dateCreated: "2024-08-22T11:55:16.271Z",
				proofObjectId: "123",
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y="
			}
		]);

		const result = await service.verify(proofId, proofObject);
		expect(result).toEqual({
			"@context": "https://schema.twindev.org/immutable-proof/",
			type: "ImmutableProofVerification",
			verified: false,
			failure: "notIssued"
		});
	});

	test("Can verify a proof that has been issued", async () => {
		await backgroundTaskConnectorEntityStorage.start("");

		const service = new ImmutableProofService();

		const proofObject = {
			"@context": "http://schema.org/",
			type: "Person",
			id: "123",
			name: "John Smith"
		};

		const proofId = await service.create(proofObject, TEST_USER_IDENTITY, TEST_NODE_IDENTITY);
		expect(proofId).toEqual(
			"immutable-proof:0101010101010101010101010101010101010101010101010101010101010101"
		);

		await waitForProofGeneration();

		const proof = await service.get(proofId);
		expect(proof).toMatchObject({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://w3id.org/security/data-integrity/v2",
				"https://schema.twindev.org/immutable-storage/"
			],
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proofObjectId: "123",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proof: {
				type: "DataIntegrityProof",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"5nGVyYtMuBRy6S3C2vABq6zZT1JirtDQogmHH6fC4LRALHzNnud5n2wC3eWECxtnXXpda1tcRoLuJEExCxDfi7Rr",
				verificationMethod:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363#immutable-proof-assertion"
			},
			immutableReceipt: {
				type: "ImmutableStorageEntityStorageReceipt"
			}
		});

		const proofStore = proofStorage.getStore();
		expect(proofStore).toMatchObject([
			{
				id: "0101010101010101010101010101010101010101010101010101010101010101",
				nodeIdentity:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				userIdentity:
					"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
				proofObjectId: "123",
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
				immutableStorageId:
					"immutable:entity-storage:0303030303030303030303030303030303030303030303030303030303030303"
			}
		]);

		const immutableStore = immutableStorage.getStore();
		expect(immutableStore).toMatchObject([
			{
				id: "0303030303030303030303030303030303030303030303030303030303030303",
				controller:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363"
			}
		]);

		const result = await service.verify(proofId, proofObject);
		expect(result).toEqual({
			"@context": "https://schema.twindev.org/immutable-proof/",
			type: "ImmutableProofVerification",
			verified: true
		});
	});
});
