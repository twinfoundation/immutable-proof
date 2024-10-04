// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { RandomHelper } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	EntityStorageImmutableStorageConnector,
	type ImmutableItem,
	initSchema as initSchemaImmutableStorage
} from "@twin.org/immutable-storage-connector-entity-storage";
import { ImmutableStorageConnectorFactory } from "@twin.org/immutable-storage-models";
import { nameof } from "@twin.org/nameof";
import { setupTestEnv, TEST_NODE_IDENTITY, TEST_USER_IDENTITY } from "./setupTestEnv";
import type { ImmutableProof } from "../src/entities/immutableProof";
import { ImmutableProofService } from "../src/immutableProofService";
import { initSchema } from "../src/schema";

let proofStorage: MemoryEntityStorageConnector<ImmutableProof>;
let immutableStorage: MemoryEntityStorageConnector<ImmutableItem>;

const FIRST_TICK = 1724327716271;

describe("ImmutableProofService", () => {
	beforeAll(async () => {
		await setupTestEnv();

		initSchema();
		initSchemaImmutableStorage();
	});

	beforeEach(async () => {
		proofStorage = new MemoryEntityStorageConnector<ImmutableProof>({
			entitySchema: nameof<ImmutableProof>()
		});

		EntityStorageConnectorFactory.register("immutable-proof", () => proofStorage);

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
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.org/",
				"https://w3id.org/security/data-integrity/v2"
			],
			type: "ImmutableProof",
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proofObjectId: "123",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y="
		});
	});

	test("Can get a proof that has been issued", async () => {
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

		await new Promise(resolve => setTimeout(resolve, 2000));

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
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
				immutableStorageId:
					"immutable:entity-storage:0404040404040404040404040404040404040404040404040404040404040404"
			}
		]);

		const proof = await service.get(proofId);
		expect(proof).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.org/",
				"https://w3id.org/security/data-integrity/v2"
			],
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proofObjectId: "123",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proof: {
				created: "2024-08-22T11:55:16.271Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"3Dqp49Wza8KtXGHzPAVknBFvwXwPk4QyjdwXVXRvVYKjDHdMyA29T6g9YhYNU64z5Hq89ggnGwmVb1Rgg3qjxMXq",
				type: "DataIntegrityProof",
				verificationMethod:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363#immutable-proof"
			}
		});

		const immutableStore = immutableStorage.getStore();
		expect(immutableStore).toEqual([
			{
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				controller:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				data: "eyJAY29udGV4dCI6WyJodHRwczovL3NjaGVtYS50d2luZGV2Lm9yZy9pbW11dGFibGUtcHJvb2YvIiwiaHR0cHM6Ly9zY2hlbWEub3JnLyIsImh0dHBzOi8vdzNpZC5vcmcvc2VjdXJpdHkvZGF0YS1pbnRlZ3JpdHkvdjIiXSwiaWQiOiIwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxIiwidHlwZSI6IkltbXV0YWJsZVByb29mIiwicHJvb2ZPYmplY3RIYXNoIjoiRUFPS3lETjBtWVFiQmg5MWVNZFZlcm94UXgxSDRHZm5SYm10Nm4vMkwvWT0iLCJwcm9vZk9iamVjdElkIjoiMTIzIiwidXNlcklkZW50aXR5IjoiZGlkOmVudGl0eS1zdG9yYWdlOjB4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1OCIsInByb29mIjp7InR5cGUiOiJEYXRhSW50ZWdyaXR5UHJvb2YiLCJjcmVhdGVkIjoiMjAyNC0wOC0yMlQxMTo1NToxNi4yNzFaIiwiY3J5cHRvc3VpdGUiOiJlZGRzYS1qY3MtMjAyMiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInByb29mVmFsdWUiOiIzRHFwNDlXemE4S3RYR0h6UEFWa25CRnZ3WHdQazRReWpkd1hWWFJ2VllLakRIZE15QTI5VDZnOVloWU5VNjR6NUhxODlnZ25Hd21WYjFSZ2czcWp4TVhxIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmVudGl0eS1zdG9yYWdlOjB4NjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MyNpbW11dGFibGUtcHJvb2YifX0="
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

		await new Promise(resolve => setTimeout(resolve, 2000));

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
				proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
				immutableStorageId:
					"immutable:entity-storage:0303030303030303030303030303030303030303030303030303030303030303"
			}
		]);

		const immutableStore = immutableStorage.getStore();
		expect(immutableStore).toEqual([
			{
				id: "0303030303030303030303030303030303030303030303030303030303030303",
				controller:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				data: "eyJAY29udGV4dCI6WyJodHRwczovL3NjaGVtYS50d2luZGV2Lm9yZy9pbW11dGFibGUtcHJvb2YvIiwiaHR0cHM6Ly9zY2hlbWEub3JnLyIsImh0dHBzOi8vdzNpZC5vcmcvc2VjdXJpdHkvZGF0YS1pbnRlZ3JpdHkvdjIiXSwiaWQiOiIwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxIiwidHlwZSI6IkltbXV0YWJsZVByb29mIiwicHJvb2ZPYmplY3RIYXNoIjoiRUFPS3lETjBtWVFiQmg5MWVNZFZlcm94UXgxSDRHZm5SYm10Nm4vMkwvWT0iLCJwcm9vZk9iamVjdElkIjoiMTIzIiwidXNlcklkZW50aXR5IjoiZGlkOmVudGl0eS1zdG9yYWdlOjB4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1OCIsInByb29mIjp7InR5cGUiOiJEYXRhSW50ZWdyaXR5UHJvb2YiLCJjcmVhdGVkIjoiMjAyNC0wOC0yMlQxMTo1NToxNi4yNzFaIiwiY3J5cHRvc3VpdGUiOiJlZGRzYS1qY3MtMjAyMiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInByb29mVmFsdWUiOiIzRHFwNDlXemE4S3RYR0h6UEFWa25CRnZ3WHdQazRReWpkd1hWWFJ2VllLakRIZE15QTI5VDZnOVloWU5VNjR6NUhxODlnZ25Hd21WYjFSZ2czcWp4TVhxIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmVudGl0eS1zdG9yYWdlOjB4NjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MyNpbW11dGFibGUtcHJvb2YifX0="
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
