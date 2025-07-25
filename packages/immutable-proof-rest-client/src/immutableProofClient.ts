// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type { IBaseRestClientConfig, ICreatedResponse } from "@twin.org/api-models";
import { Guards, NotSupportedError } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type {
	IImmutableProof,
	IImmutableProofComponent,
	IImmutableProofCreateRequest,
	IImmutableProofGetRequest,
	IImmutableProofGetResponse,
	IImmutableProofVerification,
	IImmutableProofVerifyRequest,
	IImmutableProofVerifyResponse
} from "@twin.org/immutable-proof-models";
import { nameof } from "@twin.org/nameof";
import { HeaderTypes, MimeTypes } from "@twin.org/web";

/**
 * Client for performing immutable proof through to REST endpoints.
 */
export class ImmutableProofClient extends BaseRestClient implements IImmutableProofComponent {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<ImmutableProofClient>();

	/**
	 * Create a new instance of ImmutableProofClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<ImmutableProofClient>(), config, "immutable-proof");
	}

	/**
	 * Create a new proof.
	 * @param document The document to create the proof for.
	 * @returns The id of the new proof.
	 */
	public async create(document: IJsonLdNodeObject): Promise<string> {
		Guards.object(this.CLASS_NAME, nameof(document), document);

		const response = await this.fetch<IImmutableProofCreateRequest, ICreatedResponse>("/", "POST", {
			body: {
				document
			}
		});

		return response.headers[HeaderTypes.Location];
	}

	/**
	 * Get a proof.
	 * @param id The id of the proof to get.
	 * @returns The proof.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async get(id: string): Promise<IImmutableProof> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const response = await this.fetch<IImmutableProofGetRequest, IImmutableProofGetResponse>(
			"/:id",
			"GET",
			{
				headers: {
					[HeaderTypes.Accept]: MimeTypes.JsonLd
				},
				pathParams: {
					id
				}
			}
		);

		return response.body;
	}

	/**
	 * Verify a proof.
	 * @param id The id of the proof to verify.
	 * @returns The result of the verification and any failures.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async verify(id: string): Promise<IImmutableProofVerification> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const response = await this.fetch<IImmutableProofVerifyRequest, IImmutableProofVerifyResponse>(
			"/:id/verify",
			"GET",
			{
				headers: {
					[HeaderTypes.Accept]: MimeTypes.JsonLd
				},
				pathParams: {
					id
				}
			}
		);

		return response.body;
	}

	/**
	 * Remove the verifiable storage for the proof.
	 * @param id The id of the proof to remove the storage from.
	 * @returns Nothing.
	 * @throws NotFoundError if the proof is not found.
	 */
	public async removeVerifiable(id: string): Promise<void> {
		throw new NotSupportedError(this.CLASS_NAME, "removeVerifiable");
	}
}
