// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	BackgroundTaskConnectorFactory,
	TaskStatus,
	type IBackgroundTask,
	type IBackgroundTaskConnector
} from "@twin.org/background-task-models";
import {
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	JsonHelper,
	NotFoundError,
	ObjectHelper,
	RandomHelper,
	StringHelper,
	Urn,
	Validation,
	type IValidationFailure
} from "@twin.org/core";
import { Blake2b, Sha256 } from "@twin.org/crypto";
import { JsonLdHelper, JsonLdProcessor, type IJsonLdNodeObject } from "@twin.org/data-json-ld";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IEventBusComponent } from "@twin.org/event-bus-models";
import { IdentityConnectorFactory, type IIdentityConnector } from "@twin.org/identity-models";
import {
	type IImmutableProofEventBusProofCreated,
	ImmutableProofFailure,
	ImmutableProofTopics,
	ImmutableProofTypes,
	type IImmutableProof,
	type IImmutableProofComponent,
	type IImmutableProofVerification
} from "@twin.org/immutable-proof-models";
import type {
	IImmutableProofTaskPayload,
	IImmutableProofTaskResult
} from "@twin.org/immutable-proof-task";
import {
	ImmutableStorageConnectorFactory,
	ImmutableStorageTypes,
	type IImmutableStorageConnector
} from "@twin.org/immutable-storage-models";
import { nameof } from "@twin.org/nameof";
import { DidContexts, DidCryptoSuites, DidTypes } from "@twin.org/standards-w3c-did";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import type { ImmutableProof } from "./entities/immutableProof";
import type { IImmutableProofServiceConfig } from "./models/IImmutableProofServiceConfig";

/**
 * Class for performing immutable proof operations.
 */
export class ImmutableProofService implements IImmutableProofComponent {
	/**
	 * The namespace for the service.
	 */
	public static readonly NAMESPACE: string = "immutable-proof";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<ImmutableProofService>();

	/**
	 * The configuration for the connector.
	 * @internal
	 */
	private readonly _config: IImmutableProofServiceConfig;

	/**
	 * The vault connector.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The identity connector.
	 * @internal
	 */
	private readonly _identityConnector: IIdentityConnector;

	/**
	 * The entity storage for proofs.
	 * @internal
	 */
	private readonly _proofStorage: IEntityStorageConnector<ImmutableProof>;

	/**
	 * The immutable storage for the credentials.
	 * @internal
	 */
	private readonly _immutableStorage: IImmutableStorageConnector;

	/**
	 * The background task connector.
	 * @internal
	 */
	private readonly _backgroundTaskConnector: IBackgroundTaskConnector;

	/**
	 * The event bus component.
	 * @internal
	 */
	private readonly _eventBusComponent?: IEventBusComponent;

	/**
	 * The assertion method id to use for the proofs.
	 * @internal
	 */
	private readonly _assertionMethodId: string;

	/**
	 * The proof hash key id to use for the proofs.
	 * @internal
	 */
	private readonly _proofHashKeyId: string;

	/**
	 * The identity connector type.
	 * @internal
	 */
	private readonly _identityConnectorType: string;

	/**
	 * Create a new instance of ImmutableProofService.
	 * @param options The dependencies for the immutable proof connector.
	 * @param options.config The configuration for the connector.
	 * @param options.vaultConnectorType The vault connector type, defaults to "vault".
	 * @param options.immutableProofEntityStorageType The entity storage for proofs, defaults to "immutable-proof".
	 * @param options.immutableStorageType The immutable storage, defaults to "immutable-storage".
	 * @param options.identityConnectorType The identity connector type, defaults to "identity".
	 * @param options.backgroundTaskConnectorType The background task connector type, defaults to "background-task".
	 * @param options.eventBusComponentType The event bus component type, defaults to no event bus.
	 */
	constructor(options?: {
		vaultConnectorType?: string;
		immutableProofEntityStorageType?: string;
		immutableStorageType?: string;
		identityConnectorType?: string;
		backgroundTaskConnectorType?: string;
		eventBusComponentType?: string;
		config?: IImmutableProofServiceConfig;
	}) {
		this._vaultConnector = VaultConnectorFactory.get(options?.vaultConnectorType ?? "vault");

		this._proofStorage = EntityStorageConnectorFactory.get(
			options?.immutableProofEntityStorageType ?? StringHelper.kebabCase(nameof<ImmutableProof>())
		);

		this._immutableStorage = ImmutableStorageConnectorFactory.get(
			options?.immutableStorageType ?? "immutable-storage"
		);

		this._identityConnectorType = options?.identityConnectorType ?? "identity";

		this._identityConnector = IdentityConnectorFactory.get(this._identityConnectorType);

		this._backgroundTaskConnector = BackgroundTaskConnectorFactory.get(
			options?.backgroundTaskConnectorType ?? "background-task"
		);

		if (Is.stringValue(options?.eventBusComponentType)) {
			this._eventBusComponent = ComponentFactory.get(options.eventBusComponentType);
		}

		this._config = options?.config ?? {};
		this._assertionMethodId = this._config.assertionMethodId ?? "immutable-proof-assertion";
		this._proofHashKeyId = this._config.proofHashKeyId ?? "immutable-proof-hash";

		this._backgroundTaskConnector.registerHandler<
			IImmutableProofTaskPayload,
			IImmutableProofTaskResult
		>("immutable-proof", "@twin.org/immutable-proof-task", "processProofTask", async task => {
			await this.finaliseTask(task);
		});
	}

	/**
	 * Create a new authentication proof.
	 * @param proofObject The object for the proof as JSON-LD.
	 * @param userIdentity The identity to create the immutable proof operation with.
	 * @param nodeIdentity The node identity to use for vault operations.
	 * @returns The id of the new authentication proof.
	 */
	public async create(
		proofObject: IJsonLdNodeObject,
		userIdentity?: string,
		nodeIdentity?: string
	): Promise<string> {
		Guards.object(this.CLASS_NAME, nameof(proofObject), proofObject);
		Guards.stringValue(this.CLASS_NAME, nameof(userIdentity), userIdentity);
		Guards.stringValue(this.CLASS_NAME, nameof(nodeIdentity), nodeIdentity);

		try {
			const validationFailures: IValidationFailure[] = [];
			await JsonLdHelper.validate(proofObject, validationFailures);
			Validation.asValidationError(this.CLASS_NAME, nameof(proofObject), validationFailures);

			const id = Converter.bytesToHex(RandomHelper.generate(32), false);

			const dateCreated = new Date(Date.now()).toISOString();

			const proofObjectId = ObjectHelper.extractProperty<string>(proofObject, ["@id", "id"], false);

			const hash = this.calculateHash(id, dateCreated, nodeIdentity, userIdentity, proofObject);

			const proofEntity: ImmutableProof = {
				id,
				nodeIdentity,
				userIdentity,
				dateCreated,
				proofObjectId,
				proofObjectHash: Converter.bytesToBase64(hash)
			};
			await this._proofStorage.set(proofEntity);

			const immutableProof: IImmutableProof = this.proofEntityToJsonLd(proofEntity);
			const hashData = await this.generateHashData(proofEntity.nodeIdentity, immutableProof);

			const proofTaskPayload: IImmutableProofTaskPayload = {
				proofId: id,
				nodeIdentity,
				identityConnectorType: this._identityConnectorType,
				assertionMethodId: this._assertionMethodId,
				hashData: Converter.bytesToHex(hashData)
			};

			await this._backgroundTaskConnector.create("immutable-proof", proofTaskPayload);

			return new Urn(ImmutableProofService.NAMESPACE, id).toString();
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "createFailed", undefined, error);
		}
	}

	/**
	 * Get an authentication proof.
	 * @param id The id of the proof to get.
	 * @returns The proof.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async get(id: string): Promise<IImmutableProof> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);

		if (urnParsed.namespaceIdentifier() !== ImmutableProofService.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: ImmutableProofService.NAMESPACE,
				id
			});
		}

		try {
			const { immutableProof } = await this.internalGet(id, false);

			const compacted = await JsonLdProcessor.compact(immutableProof, immutableProof["@context"]);

			return compacted as IImmutableProof;
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "getFailed", undefined, error);
		}
	}

	/**
	 * Verify an authentication proof.
	 * @param id The id of the proof to verify.
	 * @returns The result of the verification and any failures.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async verify(id: string): Promise<IImmutableProofVerification> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);

		if (urnParsed.namespaceIdentifier() !== ImmutableProofService.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: ImmutableProofService.NAMESPACE,
				id
			});
		}

		try {
			const { verified, failure } = await this.internalGet(id, true);

			return {
				"@context": ImmutableProofTypes.ContextRoot,
				type: ImmutableProofTypes.ImmutableProofVerification,
				verified,
				failure
			};
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "verifyFailed", undefined, error);
		}
	}

	/**
	 * Remove the immutable storage for the proof.
	 * @param id The id of the proof to remove the storage from.
	 * @param nodeIdentity The node identity to use for vault operations.
	 * @returns Nothing.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async removeImmutable(id: string, nodeIdentity?: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		Guards.stringValue(this.CLASS_NAME, nameof(nodeIdentity), nodeIdentity);

		const urnParsed = Urn.fromValidString(id);

		if (urnParsed.namespaceIdentifier() !== ImmutableProofService.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: ImmutableProofService.NAMESPACE,
				id
			});
		}

		try {
			const streamId = urnParsed.namespaceSpecific(0);
			const streamEntity = await this._proofStorage.get(streamId);

			if (Is.empty(streamEntity)) {
				throw new NotFoundError(this.CLASS_NAME, "proofNotFound", id);
			}

			if (Is.stringValue(streamEntity.immutableStorageId)) {
				await this._immutableStorage.remove(nodeIdentity, streamEntity.immutableStorageId);
				delete streamEntity.immutableStorageId;
				await this._proofStorage.set(streamEntity);
			}
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "removeImmutableFailed", undefined, error);
		}
	}

	/**
	 * Calculate the object hash.
	 * @param object The entry to calculate the hash for.
	 * @returns The hash.
	 * @internal
	 */
	private calculateHash(
		id: string,
		dateCreated: string,
		nodeIdentity: string,
		userIdentity: string,
		proofObject: IJsonLdNodeObject
	): Uint8Array {
		const b2b = new Blake2b(Blake2b.SIZE_256);

		b2b.update(Converter.utf8ToBytes(id));
		b2b.update(Converter.utf8ToBytes(dateCreated));
		b2b.update(Converter.utf8ToBytes(nodeIdentity));
		b2b.update(Converter.utf8ToBytes(userIdentity));
		b2b.update(ObjectHelper.toBytes(proofObject));

		return b2b.digest();
	}

	/**
	 * Map the stream entity to a model.
	 * @param proofEntity The stream entity.
	 * @returns The model.
	 * @internal
	 */
	private proofEntityToJsonLd(proofEntity: ImmutableProof): IImmutableProof {
		const model: IImmutableProof = {
			"@context": ImmutableProofTypes.ContextRoot,
			type: ImmutableProofTypes.ImmutableProof,
			id: proofEntity.id,
			userIdentity: proofEntity.userIdentity,
			proofObjectId: proofEntity.proofObjectId,
			proofObjectHash: proofEntity.proofObjectHash
		};

		return model;
	}

	/**
	 * Process a proof.
	 * @param proofEntity The proof entity to process.
	 * @internal
	 */
	private async finaliseTask(
		task: IBackgroundTask<IImmutableProofTaskPayload, IImmutableProofTaskResult>
	): Promise<void> {
		if (task.status === TaskStatus.Success && Is.object(task.payload) && Is.object(task.result)) {
			const proofEntity = await this._proofStorage.get(task.payload.proofId);

			if (Is.object(proofEntity)) {
				const immutableProof: IImmutableProof = this.proofEntityToJsonLd(proofEntity);

				// As we are adding the proof to the data we update its context
				immutableProof["@context"] = [
					ImmutableProofTypes.ContextRoot,
					DidContexts.ContextVCDataIntegrity
				];
				immutableProof.proof = task.result.proof;

				if (Is.stringValue(immutableProof.proof.created)) {
					proofEntity.dateCreated = immutableProof.proof.created;
				}

				const compacted = await JsonLdProcessor.compact(immutableProof, immutableProof["@context"]);

				const immutableStoreResult = await this._immutableStorage.store(
					proofEntity.nodeIdentity,
					ObjectHelper.toBytes(compacted)
				);

				proofEntity.immutableStorageId = immutableStoreResult.id;

				await this._proofStorage.set(proofEntity);

				await this._eventBusComponent?.publish<IImmutableProofEventBusProofCreated>(
					ImmutableProofTopics.ProofCreated,
					{ id: new Urn(ImmutableProofService.NAMESPACE, task.payload.proofId).toString() }
				);
			}
		}
	}

	/**
	 * Verify an authentication proof.
	 * @param id The id of the proof to verify.
	 * @param verify Validate the proof.
	 * @returns The result of the verification and any failures.
	 * @throws NotFoundError if the proof is not found.
	 * @internal
	 */
	private async internalGet(
		id: string,
		verify: boolean
	): Promise<{
		verified: boolean;
		failure?: ImmutableProofFailure;
		immutableProof: IImmutableProof;
	}> {
		const urnParsed = Urn.fromValidString(id);
		const proofId = urnParsed.namespaceSpecific(0);
		const proofEntity = await this._proofStorage.get(proofId);

		if (Is.empty(proofEntity)) {
			throw new NotFoundError(this.CLASS_NAME, "proofNotFound", id);
		}

		let proofModel = await this.proofEntityToJsonLd(proofEntity);
		let verified = false;
		let failure: ImmutableProofFailure | undefined = ImmutableProofFailure.NotIssued;

		if (Is.stringValue(proofEntity.immutableStorageId)) {
			failure = ImmutableProofFailure.ProofMissing;
			const immutableResult = await this._immutableStorage.get(proofEntity.immutableStorageId);

			if (Is.uint8Array(immutableResult.data)) {
				proofModel = ObjectHelper.fromBytes<IImmutableProof>(immutableResult.data);
				proofModel.immutableReceipt = immutableResult.receipt;
				// As we are adding the receipt to the data we update its context
				if (Is.array(proofModel["@context"])) {
					proofModel["@context"].push(ImmutableStorageTypes.ContextRoot);
				}

				if (verify && Is.object(proofModel.proof)) {
					if (proofModel.proof.cryptosuite !== DidCryptoSuites.EdDSAJcs2022) {
						failure = ImmutableProofFailure.CryptoSuiteMismatch;
					} else if (proofModel.proof.type !== DidTypes.DataIntegrityProof) {
						failure = ImmutableProofFailure.ProofTypeMismatch;
					} else {
						const hashData = await this.generateHashData(proofEntity.nodeIdentity, proofModel);

						const isVerified = await this._identityConnector.verifyProof(
							hashData,
							proofModel.proof
						);

						if (isVerified) {
							verified = true;
							failure = undefined;
						} else {
							failure = ImmutableProofFailure.SignatureMismatch;
						}
					}
				}
			}
		}

		return {
			immutableProof: proofModel,
			verified,
			failure
		};
	}

	/**
	 * Generate the hash data for the proof.
	 * Conforms to https://www.w3.org/TR/vc-di-eddsa/#create-proof-eddsa-jcs-2022
	 * @param nodeIdentity The node identity to use for vault operations.
	 * @param immutableProof The immutable proof to generate the hash data for.
	 * @returns The hash data.
	 * @internal
	 */
	private async generateHashData(
		nodeIdentity: string,
		immutableProof: IImmutableProof
	): Promise<Uint8Array> {
		// We hash the data for the proof without the the proof or immutable receipt for the proof
		// without these objects we can simplify the context
		const object = ObjectHelper.omit(immutableProof, ["proof", "immutableReceipt"]);
		object["@context"] = ImmutableProofTypes.ContextRoot;

		const canonicalDocument = JsonHelper.canonicalize(object);

		const proofKey = await this._vaultConnector.getKey(`${nodeIdentity}/${this._proofHashKeyId}`);

		const proofHash = Sha256.sum256(proofKey.privateKey);
		const transformedDocumentHash = Sha256.sum256(Converter.utf8ToBytes(canonicalDocument));

		const hashData = new Uint8Array(proofHash.length + transformedDocumentHash.length);
		hashData.set(proofHash);
		hashData.set(transformedDocumentHash, proofHash.length);

		return hashData;
	}
}
