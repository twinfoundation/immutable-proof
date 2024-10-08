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
				"https://schema.twindev.org/immutable-storage/",
				"https://w3id.org/security/data-integrity/v2"
			],
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proofObjectId: "123",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:55:16.271Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"5nGVyYtMuBRy6S3C2vABq6zZT1JirtDQogmHH6fC4LRALHzNnud5n2wC3eWECxtnXXpda1tcRoLuJEExCxDfi7Rr",
				verificationMethod:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363#immutable-proof"
			},
			immutableReceipt: {
				type: "ImmutableStorageEntityStorageReceipt"
			}
		});

		const immutableStore = immutableStorage.getStore();
		expect(immutableStore).toEqual([
			{
				id: "0404040404040404040404040404040404040404040404040404040404040404",
				controller:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363",
				data: "eyJAY29udGV4dCI6WyJodHRwczovL3NjaGVtYS50d2luZGV2Lm9yZy9pbW11dGFibGUtcHJvb2YvIiwiaHR0cHM6Ly9zY2hlbWEudHdpbmRldi5vcmcvaW1tdXRhYmxlLXN0b3JhZ2UvIiwiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eS9kYXRhLWludGVncml0eS92MiJdLCJpZCI6IjAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEiLCJ0eXBlIjoiSW1tdXRhYmxlUHJvb2YiLCJwcm9vZk9iamVjdEhhc2giOiJFQU9LeUROMG1ZUWJCaDkxZU1kVmVyb3hReDFINEdmblJibXQ2bi8yTC9ZPSIsInByb29mT2JqZWN0SWQiOiIxMjMiLCJ1c2VySWRlbnRpdHkiOiJkaWQ6ZW50aXR5LXN0b3JhZ2U6MHg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4IiwicHJvb2YiOnsidHlwZSI6IkRhdGFJbnRlZ3JpdHlQcm9vZiIsImNyZWF0ZWQiOiIyMDI0LTA4LTIyVDExOjU1OjE2LjI3MVoiLCJjcnlwdG9zdWl0ZSI6ImVkZHNhLWpjcy0yMDIyIiwicHJvb2ZQdXJwb3NlIjoiYXNzZXJ0aW9uTWV0aG9kIiwicHJvb2ZWYWx1ZSI6IjVuR1Z5WXRNdUJSeTZTM0MydkFCcTZ6WlQxSmlydERRb2dtSEg2ZkM0TFJBTEh6Tm51ZDVuMndDM2VXRUN4dG5YWHBkYTF0Y1JvTHVKRUV4Q3hEZmk3UnIiLCJ2ZXJpZmljYXRpb25NZXRob2QiOiJkaWQ6ZW50aXR5LXN0b3JhZ2U6MHg2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzI2ltbXV0YWJsZS1wcm9vZiJ9fQ=="
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
		expect(proof).toEqual({
			"@context": [
				"https://schema.twindev.org/immutable-proof/",
				"https://schema.twindev.org/immutable-storage/",
				"https://w3id.org/security/data-integrity/v2"
			],
			id: "0101010101010101010101010101010101010101010101010101010101010101",
			type: "ImmutableProof",
			proofObjectHash: "EAOKyDN0mYQbBh91eMdVeroxQx1H4GfnRbmt6n/2L/Y=",
			proofObjectId: "123",
			userIdentity:
				"did:entity-storage:0x5858585858585858585858585858585858585858585858585858585858585858",
			proof: {
				type: "DataIntegrityProof",
				created: "2024-08-22T11:55:16.271Z",
				cryptosuite: "eddsa-jcs-2022",
				proofPurpose: "assertionMethod",
				proofValue:
					"5nGVyYtMuBRy6S3C2vABq6zZT1JirtDQogmHH6fC4LRALHzNnud5n2wC3eWECxtnXXpda1tcRoLuJEExCxDfi7Rr",
				verificationMethod:
					"did:entity-storage:0x6363636363636363636363636363636363636363636363636363636363636363#immutable-proof"
			},
			immutableReceipt: {
				type: "ImmutableStorageEntityStorageReceipt"
			}
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
				data: "eyJAY29udGV4dCI6WyJodHRwczovL3NjaGVtYS50d2luZGV2Lm9yZy9pbW11dGFibGUtcHJvb2YvIiwiaHR0cHM6Ly9zY2hlbWEudHdpbmRldi5vcmcvaW1tdXRhYmxlLXN0b3JhZ2UvIiwiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eS9kYXRhLWludGVncml0eS92MiJdLCJpZCI6IjAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEiLCJ0eXBlIjoiSW1tdXRhYmxlUHJvb2YiLCJwcm9vZk9iamVjdEhhc2giOiJFQU9LeUROMG1ZUWJCaDkxZU1kVmVyb3hReDFINEdmblJibXQ2bi8yTC9ZPSIsInByb29mT2JqZWN0SWQiOiIxMjMiLCJ1c2VySWRlbnRpdHkiOiJkaWQ6ZW50aXR5LXN0b3JhZ2U6MHg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4NTg1ODU4IiwicHJvb2YiOnsidHlwZSI6IkRhdGFJbnRlZ3JpdHlQcm9vZiIsImNyZWF0ZWQiOiIyMDI0LTA4LTIyVDExOjU1OjE2LjI3MVoiLCJjcnlwdG9zdWl0ZSI6ImVkZHNhLWpjcy0yMDIyIiwicHJvb2ZQdXJwb3NlIjoiYXNzZXJ0aW9uTWV0aG9kIiwicHJvb2ZWYWx1ZSI6IjVuR1Z5WXRNdUJSeTZTM0MydkFCcTZ6WlQxSmlydERRb2dtSEg2ZkM0TFJBTEh6Tm51ZDVuMndDM2VXRUN4dG5YWHBkYTF0Y1JvTHVKRUV4Q3hEZmk3UnIiLCJ2ZXJpZmljYXRpb25NZXRob2QiOiJkaWQ6ZW50aXR5LXN0b3JhZ2U6MHg2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzNjM2MzYzI2ltbXV0YWJsZS1wcm9vZiJ9fQ=="
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
